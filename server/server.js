// API and Auth Configuration
const API_URL = window.location.origin;
let authToken = localStorage.getItem('authToken');

// DOM Elements
const greetingEl = document.getElementById('greeting');
const progressEl = document.getElementById('today-progress');
const completedTasksEl = document.getElementById('completed-tasks');
const totalTasksEl = document.getElementById('total-tasks');
const tasksListEl = document.getElementById('tasks-list');
const addTaskBtn = document.getElementById('add-task-button');
const taskTemplate = document.getElementById('task-template');

// Timer Elements
const timerDisplay = document.querySelector('.time');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const timerSound = document.getElementById('timer-complete');
const progressRing = document.querySelector('.progress-ring-circle');

// Constants
const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds
const RADIUS = 98;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// State
let tasks = [];
let timeLeft = WORK_TIME;
let timerId = null;
let isRunning = false;

// Authentication Functions
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error('Invalid credentials');
        
        const data = await response.json();
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        
        checkAuth(); // This will show the main app
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

async function register(name, email, password) {
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) throw new Error('Registration failed');
        
        // Auto login after registration
        await login(email, password);
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}

function checkAuth() {
    if (!authToken) {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('main-app').style.display = 'none';
    } else {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        loadTasks(); // Load tasks for authenticated user
    }
}

// Task Management Functions
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/api/tasks`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        if (!response.ok) throw new Error('Failed to load tasks');
        tasks = await response.json();
        
        tasksListEl.innerHTML = '';
        tasks.forEach(task => {
            const taskEl = createTaskElement(task);
            tasksListEl.appendChild(taskEl);
        });
        updateProgress();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function addTask() {
    const task = {
        title: 'New Task',
        due: 'Today',
        completed: false,
        urgency: 'medium',
        category: 'all'
    };

    try {
        const response = await fetch(`${API_URL}/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(task)
        });
        if (!response.ok) throw new Error('Failed to add task');
        await loadTasks(); // Reload tasks after adding
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

async function toggleTask(id) {
    try {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const response = await fetch(`${API_URL}/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                ...task,
                completed: !task.completed
            })
        });
        if (!response.ok) throw new Error('Failed to update task');
        await loadTasks();
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/api/tasks/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete task');
        await loadTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// UI Helper Functions
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    completedTasksEl.textContent = completed;
    totalTasksEl.textContent = total;

    const progress = total === 0 ? 0 : (completed / total) * 100;
    progressEl.style.width = `${progress}%`;
}

function createTaskElement(task) {
    const clone = taskTemplate.content.cloneNode(true);
    const container = clone.querySelector('.task-container');
    const checkbox = clone.querySelector('.task-checkbox');
    const title = clone.querySelector('.task-title');
    const due = clone.querySelector('.task-due');
    const urgencySelect = clone.querySelector('.urgency-selector');
    const deleteBtn = clone.querySelector('.delete-task');

    container.dataset.id = task.id;
    container.dataset.urgency = task.urgency;
    checkbox.checked = task.completed;
    title.textContent = task.title;
    due.textContent = task.due;
    urgencySelect.value = task.urgency;

    checkbox.addEventListener('change', () => toggleTask(task.id));
    urgencySelect.addEventListener('change', (e) => updateTaskUrgency(task.id, e.target.value));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    return clone;
}

// Event Listeners
function setupEventListeners() {
    // Auth form listeners
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;
        await login(email, password);
    });

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = e.target.querySelector('input[type="text"]').value;
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;
        await register(name, email, password);
    });

    // Add task button listener
    addTaskBtn.addEventListener('click', addTask);

    // Timer control listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
}

// Initialize
function init() {
    checkAuth();
    updateGreeting();
    setInterval(updateGreeting, 60000);
    setupEventListeners();
    initializeTimer();
    loadDailyAffirmation();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

// Keep your existing timer and other utility functions...