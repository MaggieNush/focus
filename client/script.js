function setupEventListeners() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Login form submitted');
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }
            
            try {
                await login(email, password);
            } catch (error) {
                console.error('Login submission error:', error);
                alert('Login failed: ' + error.message);
            }
        });
    } else {
        console.error('Login form not found!');
    }
    
    // ... rest of your event listeners ...

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
        console.log('Making login request to:', `${API_URL}/api/auth/login`);

        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Login response received:', {
            status: response.status,
            ok: response.ok
        });

        const data = await response.json();
        console.log('Login response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        
        console.log('Login successful, token stored');
        
        // Show main app
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        
        // Load tasks
        await loadTasks();
    } catch (error) {
        console.error('Login error details:', error);
        alert('Login failed: ' + error.message);
    }
}

function checkAuth() {
    if (!authToken) {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('main-app').style.display = 'none';
    } else {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        loadTasks();
    }
}

// Tasks Functions
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
        await loadTasks();
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
    const loginForm = document.getElementById('login-form');
    console.log('Login form found:', loginForm); // Debug log

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Login form submitted'); // Debug log
        
        const emailInput = e.target.querySelector('input[name="email"]');
        const passwordInput = e.target.querySelector('input[name="password"]');
        
        console.log('Form elements:', { 
            emailFound: !!emailInput, 
            passwordFound: !!passwordInput 
        }); // Debug log
        
        const email = emailInput.value;
        const password = passwordInput.value;
        
        console.log('Attempting login with email:', email); // Debug log
        await login(email, password);
    });

    // Add task button listener
    addTaskBtn.addEventListener('click', addTask);

    // Timer control listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
}

// Timer Functions
function initializeTimer() {
    progressRing.style.strokeDasharray = CIRCUMFERENCE;
    updateProgressRing();
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateProgressRing() {
    const progress = timeLeft / WORK_TIME;
    const offset = CIRCUMFERENCE * (1 - progress);
    progressRing.style.strokeDashoffset = offset;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        timerId = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            updateProgressRing();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                isRunning = false;
                notifyTimerComplete();
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = WORK_TIME;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    updateTimerDisplay();
    updateProgressRing();
}

// Initialize
function init() {
    checkAuth();
    updateGreeting();
    setInterval(updateGreeting, 60000);
    setupEventListeners();
    initializeTimer();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);