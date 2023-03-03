function $(selector) {
    return document.querySelector(selector)
}

let todoAPI = 'https://63f0fc4c5703e063fa507bed.mockapi.io/TodoItem'

const listInput = document.querySelectorAll('.input-text')
const btnClose = $('.btn-close')
const modal = $('.modal')
const btnOpen = $('.open-modal')
const todo = $('.todo')
const doing = $('.doing')
const finished = $('.finished')
const wrapItems = document.querySelectorAll('.todo-items')
const todoCount = $('.todo-count')
const doingCount = $('.doing-count')
const finishedCount = $('.finished-count')
const statusItem = $('.status-item')
const selectStatus = $('.status')
const lists = document.querySelectorAll('.list');
const statusLists = document.querySelectorAll('.status-list')
const textForm = document.querySelector('.text-form')
let dragItem = {}

let listItem = []
let checkUp = false
let idUp = 0
let idDrag = 0
let dragStatus = ''

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
const today = new Date();


function fetchData(callback) {
    axios.get(todoAPI)
        .then(function (response) {
            listItem = response
            return response.data;
        })
        .then(callback);
}

function filterItems(Items) {
    const todoItems = Items.filter(item => item.Status === 'todo')
    const doingItems = Items.filter(item => item.Status === 'doing')
    const doneItems = Items.filter(item => item.Status === 'finished')

    return [todoItems, doingItems, doneItems]
}

function renderItem(item) {
    return `
        <div class="card flex flex-col gap-4 select-none shadow-lg" draggable="true" ondragstart="eventDragStart(event, ${item.Id})" ondragend="eventDragEnd(event)">
            <div class="h-[216px] rounded-lg bg-white border py-5 px-4">
                <div class="flex w-full">
                    <div class="lg:w-[252px] w-full">
                        <div class="text-xs text-[#4D8EFF] font-bold mb-1">${item.Category}</div>
                        <div class="leading-5 text-base font-bold mb-6">${item.Title}</div>
                        <div class="h-[0.5px] bg-[#DBDBDB]"></div>
                    </div>
                    <div class="flex gap-4 w-[90px] justify-center">
                        <i class="fa-solid fa-pen cursor-pointer" onclick="loadDataForm(${item.Id})"></i>                         
                        <i class="fa-solid fa-trash cursor-pointer" onclick="handleDel(${item.Id})"></i>
                    </div>
                </div>
                <div class="text-[10px] text-[#5A5C63] mt-2">
                    <div class=" mb-1">${item.Content}</div>
                    <div class="flex items-center gap-2">
                        <i class="fa-regular fa-clock"></i>
                        <div>${item.Time}</div>
                    </div>
                </div>
            </div>
        </div>
`
}

function showItems(items) {
    const [todoItems, doingItems, doneItems] = filterItems(items)
    listItem = items
    let htmlsTodo = ''
    let htmlsDoing = ''
    let htmlsFinished = ''
    htmlsTodo = todoItems.map(item => renderItem(item))
    htmlsDoing = doingItems.map(item => renderItem(item))
    htmlsFinished = doneItems.map(item => renderItem(item))
    todo.innerHTML = htmlsTodo.join('')
    doing.innerHTML = htmlsDoing.join('')
    finished.innerHTML = htmlsFinished.join('')
    todoCount.innerHTML = todoItems.length
    doingCount.innerHTML = doingItems.length
    finishedCount.innerHTML = doneItems.length
}


const emptyInput = (input) => {
    if (input.value == '') {
        input.style.border = '2px solid red'
        return false
    } else {
        input.style.border = '2px solid green'
        return true
    }
}

const setValueEmpty = () => {
    listInput.forEach(item => {
        item.value = ''
        item.style.border = '1px solid black'
    })
}

const valueItemToInput = () => {
    const item = {
        'Category': listInput[0].value,
        'Title': listInput[1].value,
        'Content': listInput[2].value,
        'Time': `${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`,
        'Status': selectStatus.value
    }
    return item
}

function openFormUpdate() {
    textForm.innerHTML = 'Edit todo'
    modal.classList.remove('hidden')
    modal.classList.add('flex')
    statusItem.classList.remove('hidden')
    statusItem.classList.add('flex')
}

function handleCreateTodoItem(data, callback) {
    let res = axios({
        method: 'post',
        url: todoAPI,
        data: data
    })
        .then(function (response) {
            return response.data;
        })
        .then(callback);
}

const handleAdd = () => {
    let checkInput = false
    listInput.forEach(item => {
        checkInput = emptyInput(item)   
    });

    if (checkInput) {
        let data = valueItemToInput()
        data['Status'] = 'todo'
        handleCreateTodoItem(data, (res) => {
            listItem.push(res)
            showItems(listItem)
            setValueEmpty()
            modal.classList.add('hidden')
        })
    }
}

const handleDel = (id) => {
    try {
        let options = axios({
            method: 'DELETE',
            url: `${todoAPI}/${id}`,
            data: {
                id: id
            }
        })
            .then(function (response) {
                response.data;
            });

        listItem = listItem.filter(item => item.Id != id)
        showItems(listItem)
    } catch (error) {
        console.log(error)
    }
}

const handleUp = (item) => {
    try {
        let options = axios({
            method: 'PUT',
            url: `${todoAPI}/${idUp}`,
            data: item
        })
            .then(function (response) {
                return response.data;
            }).then(function(res){
                listItem = listItem.map(item => item.Id == idUp ? res : item)
                showItems(listItem)
            })
        setValueEmpty()
        modal.classList.add('hidden')
        statusItem.classList.add('hidden')
        checkUp = false
    } catch (error) {
        console.log(error)
    }
}

const loadDataForm = (id) => {
    checkUp = true
    idUp = id
    let item = {}
    item = listItem.find(e1 => e1.Id == id)
    openFormUpdate()
    listInput[0].value = item.Category
    listInput[1].value = item.Title
    listInput[2].value = item.Content
    selectStatus.value = item.Status
}

$('.form-add').addEventListener('submit', (e) => {
    e.preventDefault()
    if(checkUp){
        const item = valueItemToInput()
        handleUp(item)
    } 
    else handleAdd()
})

btnClose.addEventListener('click', () => {
    modal.classList.add('hidden')
    statusItem.classList.add('hidden')
})

btnOpen.addEventListener('click', () => {
    modal.classList.remove('hidden')
    modal.classList.add('flex')
    setValueEmpty()
})


function eventDragStart(e, id){
    idDrag = id
    e.target.classList.add('dragging');
}

function eventDragEnd(e){
    e.target.classList.remove('dragging');
    let itemDrag = listItem.find(e1 => e1.Id == idDrag)
    itemDrag.Status = dragStatus
    listItem = listItem.map(item => item.Id == idDrag ? itemDrag : item)
    idUp = idDrag
    handleUp(itemDrag)
}

function main() {
    try {
        fetchData(showItems)
    } catch (error) {
        alert("Loading failed")
    } finally {
    }
}

main()


// Kéo thả

function getCardAfterDraggingCard(list, yDraggingCard){

    let listCards = [...list.querySelectorAll('.card:not(.dragging)')];
    return listCards.reduce((closestCard, nextCard)=>{
        let nextCardRect = nextCard.getBoundingClientRect();
        let offset = yDraggingCard - nextCardRect.top - nextCardRect.height /2;

        if(offset < 0 && offset > closestCard.offset){
            return {offset, element: nextCard}
        } else{
            return closestCard;
        }
    
    }, {offset: Number.NEGATIVE_INFINITY}).element;

}


lists.forEach((list)=>{
    list.addEventListener('dragover', (e)=>{
        e.preventDefault();
        let draggingCard = document.querySelector('.dragging');
        let cardAfterDraggingCard = getCardAfterDraggingCard(list, e.clientY);
        if(cardAfterDraggingCard){
            cardAfterDraggingCard.parentNode.insertBefore(draggingCard, cardAfterDraggingCard);
        } else{
            list.appendChild(draggingCard);
        }
        dragStatus = list.getAttribute('value')
    });
});


statusLists.forEach((statusList, index) => {
    statusList.addEventListener('click', function(){
        let width = document.body.clientWidth; 
        if(width < 1024){
            lists[index].classList.toggle('h-0')
        }
    })
})

window.addEventListener('resize', function(e){
    let width = document.body.clientWidth;
    if(width > 1024){
        let listHeightNone = this.document.querySelectorAll('.list.h-0')
        listHeightNone.forEach(itemHeightNone => {
            itemHeightNone.classList.remove('h-0')
        })
    }
})












