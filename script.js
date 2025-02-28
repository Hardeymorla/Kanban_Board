const modal = document.querySelector('.confirm-modal');
const columnsContainer = document.querySelector('.columns');
const columns = document.querySelectorAll('.column');

let currentTask = null;

// functions

const handleDragOver = (event) =>  {
    event.preventDefault();
    const draggedTask = document.querySelector(".dragging");
    const target = event.target.closest(".task, .tasks");
   
    console.log("Dragged Task:", draggedTask);
    console.log("Target:", target);

    if (!target || target === draggedTask) return;

    if (target.classList.contains("tasks")) {
        //Target is the task Element
        const lastTask = target.lastElementChild;
        if(!lastTask){
            //Task is Empty
            target.appendChild(draggedTask);
        } else {
            const { bottom } = lastTask.getBoundingClientRect();
            event.clientY > bottom && target.appendChild(draggedTask);
        }
    }
    else{
        //Target is another task
        const { top, height } = target.getBoundingClientRect();
        const distance = top + height / 2;

        if (event.clientY < distance) {
            target.before(draggedTask);
        } else {
            target.after(draggedTask);
        }
    }
}

const handleDrop = (event) => {
    event.preventDefault();
    console.log('drop');
}

const handleDragEnd = (event) => {
    event.target.classList.remove('dragging');    

}
const handleDragStart = (event) => {
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData('text/plain', '');
    requestAnimationFrame(() => event.target.classList.add('dragging'));
}

const handleDelete = (event) => {
    currentTask = event.target.closest(".task");
    console.log(currentTask);

    // Show Preview
    modal.querySelector('.preview').innerText = currentTask.innerText.substring(0, 100);
    console.log(currentTask.innerText);

    modal.showModal();
}
const handleEdit = (event) => {
    const task = event.target.closest(".task");
    console.log(task);
    const input = createTaskInput(task.innerText);
    task.replaceWith(input);
    input.focus();

    // Move cursor to the right
    const selection = window.getSelection();
    selection.selectAllChildren(input);
    selection.collapseToEnd();
}

const handleBlur = (event) => {
    const input = event.target;
    const content = input.innerText.trim() || input.remove();
    const task = createTask(content.replace(/\n/g, "<br>"));
    input.replaceWith(task);
    
}
const handleAdd = (event) => {
    const taskEl = event.target.closest('.column').lastElementChild;
    const input = createTaskInput();
    taskEl.appendChild(input);
    input.focus();
}

const updateTaskCount = (column) => {
    const tasks = column.querySelector(".tasks").children;
    console.log(tasks);
    const taskCount = tasks.length;
    column.querySelector('.column-title h3').dataset.tasks = taskCount;
}
const observeTaskChanges = () => {
    for (const column of columns) {
        const observer = new MutationObserver(() => updateTaskCount(column));
        observer.observe(column.querySelector(".tasks"), { childList: true });
    }
};
observeTaskChanges();


const createTask = (content) => {
    // Extract first letters for initials or use a random emoji as a fallback
    const initials = content
        .split(' ')
        .map(word => word[0].toUpperCase())
        .join('')
        .substring(0, 2);
    const avatar = `<div class="avatar">${initials}</div>`;
    
    const task = document.createElement('div');
    task.className = 'task';
    task.draggable = true;
    task.innerHTML = `
        <div class="task-content">
            ${avatar}
            <div>${content}</div>
        </div>
        <menu>
            <button data-edit><i class="bx bxs-edit"></i></button>
            <button data-delete><i class="bx bxs-trash-alt"></i></button>
        </menu> `;
    task.addEventListener('dragstart', handleDragStart);
    task.addEventListener('dragend', handleDragEnd);
    return task;
};


const createTaskInput = (text = " ") => {
    const input = document.createElement('div');
    input.className = 'task-input';
    input.dataset.placeholder = "task name"
    input.contentEditable = true;
    input.innerHTML = text;
    input.addEventListener('blur', handleBlur);
    return input;
}

// Event Listeners
tasksElements = columnsContainer.querySelectorAll(".tasks");
for (const tasksEl of tasksElements) {
    tasksEl.addEventListener("dragover", handleDragOver);
    tasksEl.addEventListener("drop", handleDrop);
}

// Add, Edit, and Delete task
columnsContainer.addEventListener('click', (event) => {
    if (event.target.closest('button[data-add]')) {
        handleAdd(event);
       
    } else if (event.target.closest('button[data-edit]')) {
        console.log("clicked")
        handleEdit(event);
    } else if (event.target.closest('button[data-delete]')) {
        handleDelete(event);
       
    }
})

// Store and retrieve tasks from localStorage
const saveTasks = () => {
    const tasks = Array.from(document.querySelectorAll('.task')).map(task => task.innerText);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };
  
  const loadTasks = () => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    savedTasks.forEach(content => {
      const task = createTask(content);
      document.querySelector('.tasks').appendChild(task);
    });
  };
  
  // Call this at the start to load tasks from localStorage
  loadTasks();
  
  // Handle task deletion
  modal.addEventListener("submit", (event) => {
      event.preventDefault(); // Prevent form reload
      currentTask && currentTask.remove();
      saveTasks(); // Update localStorage after deletion
      modal.close();
  });
  
  // Close modal without deleting
  modal.querySelector('#cancel').addEventListener("click", () => modal.close());
  modal.addEventListener("close", () => (currentTask = null));
  


