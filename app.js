//TOGGLE LIST

const chk = document.getElementById('chk');
const chk_l = document.getElementById('chk-l');
const logoEL = document.getElementById("logo");
const listTitleEL = document.getElementById("category")

//CATEGORY LIST

const listContainer = document.querySelector("[data-lists]")
const newListForm = document.querySelector("[data-new-list-form]")
const newListInput = document.querySelector("[data-new-list-input]")
const deleteListButton = document.querySelector("[data-delete-list-button]")

//2DO LIST

const listDisplayContainer = document.querySelector("[data-list-display-container]")
const listTitleElement = document.querySelector("[data-list-title]")
const listCountElement = document.querySelector("[data-list-count]")
const taskContainer = document.querySelector("[data-tasks]")
const taskTemplate = document.getElementById("task-template")
const newTaskForm = document.querySelector("[data-new-task-form]")
const newTaskInput = document.querySelector("[data-new-task-input]")
const clearCompleteTaskButton = document.querySelector("[data-clear-complete-tasks-button]")

const LOCAL_STORAGE_LIST_KEY = "task.list"
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.selectedListId"
const LOCAL_STORAGE_MODE_KEY = "mode"
const LOCAL_STORAGE_LANG_KEY = "lang"


let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);
let mode = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MODE_KEY));
let lang = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LANG_KEY));

const translation  = {
    en:{
        title: "2do list",
        category: "Category",
        category_placeholder: "New category",
        task_placeholder: "New task",
        clearBtn: "Clear completed",
        deleteBtn: "Delete list",
        taskMulti: "tasks",
        taskSingle: "task",
        task_2_4: "tasks",
        remainingMulti: "remaining",
        remainingSingle: "remaining",
        remaining_2_4: "remaining"
    },
    hr:{
        title: "Lista zadataka",
        category: "Kategorije",
        category_placeholder: "Nova kategorija",
        task_placeholder: "Novi zadatak",
        clearBtn: "Očisti završene",
        deleteBtn: "Obriši listu",
        taskMulti: "zadataka",
        taskSingle: "zadatak",
        task_2_4: "zadatka",
        remainingMulti: "preostalo",
        remainingSingle: "preostao",
        remaining_2_4: "preostala"
    }
}


listContainer.addEventListener("click", e => {
    if(e.target.tagName.toLowerCase()=== "li") {
        selectedListId = e.target.dataset.listId
        saveAndRender()
    } else if (e.target.tagName.toLowerCase()=== "span"){
        selectedListId = e.target.parentElement.dataset.listId
        saveAndRender()
    }
})

taskContainer.addEventListener("click", e => {
    if(e.target.tagName.toLowerCase() === "input") {
        const selectedList = lists.find(list => list.id === selectedListId)
        const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
        selectedTask.complete = e.target.checked
        saveAndRender()
        renderTaskCount(selectedList)
    }
})

clearCompleteTaskButton.addEventListener("click", e => {
    const selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
    saveAndRender()
})

deleteListButton.addEventListener("click", e => {
    lists = lists.filter(list => list.id !== selectedListId)
    selectedListId = null
    saveAndRender()
})

newListForm.addEventListener("submit", e => {
    e.preventDefault()
    const listName = newListInput.value 
    if (listName == null || listName === "") return
    const list = createList(listName)
    newListInput.value = null
    lists.push(list)
    saveAndRender()
})

newTaskForm.addEventListener("submit", e => {
    e.preventDefault()
    const taskName = newTaskInput.value 
    if (taskName == null || taskName === "") return
    const task = createTask(taskName)
    newTaskInput.value = null
    const selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks.push(task)
    saveAndRender()
})

function createTask(name) {
    return {id: Date.now().toString(), name: name, complete: false}
}

function createList(name) {
   return {id: Date.now().toString(), name: name, tasks:[]}
}

function saveAndRender() {
    save()
    render()
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY,selectedListId)
    localStorage.setItem(LOCAL_STORAGE_MODE_KEY,JSON.stringify(mode))
    localStorage.setItem(LOCAL_STORAGE_LANG_KEY,JSON.stringify(lang))
}

function render() {
    clearElement(listContainer)
    renderList()
    dark(mode)
    translate(lang)

    const selectedList = lists.find(list => list.id === selectedListId)
    if(selectedListId == null) {
        listDisplayContainer.style.display = "none"
    } else {
        listDisplayContainer.style.display = ""
        listTitleElement.innerText = selectedList.name
        renderTaskCount(selectedList)
        clearElement(taskContainer)
        renderTasks(selectedList)
    }
}

function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true)
        const checkbox = taskElement.querySelector ("input")
        checkbox.id = task.id
        checkbox.checked = task.complete
        const label = taskElement.querySelector ("label")
        label.htmlFor = task.id
        label.append(task.name)
        taskContainer.appendChild(taskElement)
    })
}

function renderTaskCount(selectedList) {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length
    
    switch (incompleteTaskCount) {
        
        case 1:
            listCountElement.innerText = `${incompleteTaskCount} ${translation[lang].taskSingle} ${translation[lang].remainingSingle}`
            break;
        case 2:
        case 3:
        case 4:
            listCountElement.innerText = `${incompleteTaskCount} ${translation[lang].task_2_4} ${translation[lang].remaining_2_4}`
            break;    
        default:
            listCountElement.innerText = `${incompleteTaskCount} ${translation[lang].taskMulti} ${translation[lang].remainingMulti}`
            break;
    }

}

function renderList() {
    lists.forEach(list => {
        const incompleteTaskCount = list.tasks.filter(task => !task.complete).length
        const listElement = document.createElement("li")
        listElement.dataset.listId = list.id
        listElement.classList.add("list-name")
        listElement.innerHTML = `<span>${list.name}</span> <span>${incompleteTaskCount}</span>`
        if (list.id === selectedListId) {
            listElement.classList.add("active-list")
        }
        listContainer.appendChild(listElement)
    })
}

function clearElement(element) {
    while(element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

// DARK MODE TOGGLE

chk.addEventListener('change', () => {
    if(chk.checked){
        mode = "dark"
    }else{
        mode = "light"
    }
    saveAndRender()
});

function dark(mode) {
    if(mode === "dark"){
        document.body.classList.add("dark")
        chk.checked = true;
    }else{
        document.body.classList.remove('dark');
        chk.checked = false;
    }
}



// LANGUAGE TOGGLE

chk_l.addEventListener("change", () => {
    if(chk_l.checked){
        lang = "hr"
    }else{
        lang = "en"
    }

    saveAndRender()
    
})

function translate(lang) {
    logoEL.innerText = translation[lang].title
    listTitleEL.innerText = translation[lang].category
    newListInput.placeholder = translation[lang].category_placeholder
    newTaskInput.placeholder = translation[lang].task_placeholder
    clearCompleteTaskButton.innerText = translation[lang].clearBtn
    deleteListButton.innerText = translation[lang].deleteBtn

    if(lang === "hr"){
        chk_l.checked = true;
    }else{
        chk_l.checked = false;
    }

}



render();

//-render
//-local storage drzi state toggla(chekboxa)-
//-funkcija koja mijenja translation-
