let currentUser = null;
let todos = [];
let currentFilter = 'all';

// User Management
function switchToSignup() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('signupSection').style.display = 'block';
}

function switchToLogin() {
    document.getElementById('signupSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
}

// Signup
document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.email === email)) {
        alert('Email already exists!');
        return;
    }
    
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created successfully! Please login.');
    switchToLogin();
    document.getElementById('signupForm').reset();
});

// Login
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showTodoApp();
        loadUserTodos();
    } else {
        alert('Invalid credentials!');
    }
});

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('todoSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('loginForm').reset();
}

function showTodoApp() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('signupSection').style.display = 'none';
    document.getElementById('todoSection').style.display = 'block';
    document.getElementById('userName').textContent = `Welcome, ${currentUser.name}!`;
}

// Todo Management
function loadUserTodos() {
    const allTodos = JSON.parse(localStorage.getItem('todos') || '{}');
    todos = allTodos[currentUser.email] || [];
    renderTodos();
}

function saveUserTodos() {
    const allTodos = JSON.parse(localStorage.getItem('todos') || '{}');
    allTodos[currentUser.email] = todos;
    localStorage.setItem('todos', JSON.stringify(allTodos));
    updateStats();
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const priority = document.getElementById('prioritySelect').value;
    const text = input.value.trim();
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: priority,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };
    
    todos.unshift(todo);
    saveUserTodos();
    input.value = '';
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveUserTodos();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveUserTodos();
        renderTodos();
    }
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
}

function filterTodos(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderTodos();
}

function renderTodos() {
    let filteredTodos = todos;
    
    if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    } else if (currentFilter === 'pending') {
        filteredTodos = todos.filter(t => !t.completed);
    }
    
    const todoList = document.getElementById('todoList');
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">No tasks found. Add your first task above!</div>';
        updateStats();
        return;
    }
    
    todoList.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input type="checkbox" class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''} 
                onclick="toggleTodo(${todo.id})">
            <div class="todo-text">${escapeHtml(todo.text)}</div>
            <span class="priority-badge priority-${todo.priority}">
                ${todo.priority.toUpperCase()}
            </span>
            <div class="todo-date">
                <i class="far fa-calendar-alt"></i> ${todo.date}
            </div>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `).join('');
    
    updateStats();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Check for existing session
window.onload = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showTodoApp();
        loadUserTodos();
    }
};

// Add enter key support
document.getElementById('todoInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});