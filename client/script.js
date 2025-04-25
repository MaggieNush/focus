// DOM Elements
const greetingEl = document.getElementById('greeting');
const progressEl = document.getElementById('today-progress');
const completedTasksEl = document.getElementById('completed-tasks');
const totalTasksEl = document.getElementById('total-tasks');
const tasksListEl = document.getElementById('tasks-list');
const addTaskBtn = document.getElementById('add-task-button');
const taskTemplate = document.getElementById('task-template');

// Timer Elements
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const progressRing = document.querySelector('.progress-ring-circle');

// Constants
const POMODORO_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds
const RADIUS = 98;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let timer = null;
let timeLeft = POMODORO_TIME;
let isRunning = false;

// Initialize
function init() {
    updateGreeting();
    setInterval(updateGreeting, 60000); // Update greeting every minute
    loadTasks();
    setupEventListeners();
    setupProgressRing();
    loadDailyAffirmation();
}

// Greeting
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    greetingEl.textContent = `${greeting}, let's focus! 🌟`;
}

// Tasks
function loadTasks() {
    tasksListEl.innerHTML = '';
    tasks.forEach(task => {
        const taskEl = createTaskElement(task);
        tasksListEl.appendChild(taskEl);
    });
    updateProgress();
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

    // Event Listeners
    checkbox.addEventListener('change', () => toggleTask(task.id));
    urgencySelect.addEventListener('change', (e) => updateTaskUrgency(task.id, e.target.value));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    return clone;
}

function addTask() {
    const task = {
        id: Date.now(),
        title: 'New Task',
        due: 'Today',
        completed: false,
        urgency: 'medium',
        category: 'all'
    };

    tasks.push(task);
    saveTasks();
    loadTasks();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        updateProgress();
    }
}

function updateTaskUrgency(id, urgency) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.urgency = urgency;
        saveTasks();
        loadTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    loadTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    completedTasksEl.textContent = completed;
    totalTasksEl.textContent = total;

    const progress = total === 0 ? 0 : (completed / total) * 100;
    progressEl.style.width = `${progress}%`;
}

// Timer elements
const timerDisplay = document.querySelector('.time');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const timerSound = document.getElementById('timer-complete');
const progressRing = document.querySelector('.progress-ring-circle');

// Timer settings
const WORK_TIME = 25 * 60; // 25 minutes in seconds
const RADIUS = 98;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Timer state
let timeLeft = WORK_TIME;
let timerId = null;
let isRunning = false;

// Initialize progress ring
function initializeTimer() {
    progressRing.style.strokeDasharray = CIRCUMFERENCE;
    updateProgressRing();
    updateTimerDisplay();
}

// Update the timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update the progress ring
function updateProgressRing() {
    const progress = timeLeft / WORK_TIME;
    const offset = CIRCUMFERENCE * (1 - progress);
    progressRing.style.strokeDashoffset = offset;
}

// Timer complete notification
function notifyTimerComplete() {
    // Play sound
    timerSound.play();

    // Show browser notification if permitted
    if (Notification.permission === "granted") {
        new Notification("Pomodoro Complete!", {
            body: "Time to take a break!",
            icon: "path-to-your-icon.png" // You can add an icon path here
        });
    }

    // Show alert dialog
    const modal = document.createElement('div');
    modal.className = 'timer-alert-modal';
    modal.innerHTML = `
        <div class="timer-alert-content">
            <h2>Time's Up! 🎉</h2>
            <p>Great work! Take a short break.</p>
            <button onclick="this.parentElement.parentElement.remove()">OK</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Add some vibration if supported
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }
}

// Start timer function
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
                notifyTimerComplete();
                resetTimer();
            }
        }, 1000);
    }
}

// Pause timer function
function pauseTimer() {
    if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

// Reset timer function
function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = WORK_TIME;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    updateTimerDisplay();
    updateProgressRing();
}

// Request notification permission
function requestNotificationPermission() {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTimer();
    requestNotificationPermission();
});

// Add this CSS to your style.css file
const timerAlertStyles = `
.timer-alert-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
}

.timer-alert-content {
    background: var(--surface);
    padding: 2rem;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease-out;
}

.timer-alert-content h2 {
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.timer-alert-content button {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    margin-top: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.timer-alert-content button:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from { 
        opacity: 0;
        transform: translateY(-20px);
    }
    to { 
        opacity: 1;
        transform: translateY(0);
    }
}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = timerAlertStyles;
document.head.appendChild(styleSheet);

// Daily Affirmations
const affirmations = [
    "You've got this! Take it one task at a time.",
    "Every small step counts towards your goals.",
    "Your focus determines your reality.",
    "Today's progress is tomorrow's success.",
    "You are capable of amazing things.",
    "Stay focused, stay positive, stay productive."
];

function loadDailyAffirmation() {
    const affirmationBox = document.getElementById('daily-affirmation');
    const today = new Date().toDateString();
    const savedAffirmation = localStorage.getItem('dailyAffirmation');
    const savedDate = localStorage.getItem('affirmationDate');

    if (savedDate === today && savedAffirmation) {
        affirmationBox.textContent = savedAffirmation;
    } else {
        const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
        affirmationBox.textContent = randomAffirmation;
        localStorage.setItem('dailyAffirmation', randomAffirmation);
        localStorage.setItem('affirmationDate', today);
    }
}

// Event Listeners
function setupEventListeners() {
    addTaskBtn.addEventListener('click', addTask);
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Category filters
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelector('.category-pill.active').classList.remove('active');
            pill.classList.add('active');
            filterTasks(pill.dataset.category);
        });
    });

    // Mood tracking
    document.querySelectorAll('.mood-button').forEach(button => {
        button.addEventListener('click', () => {
            const mood = button.dataset.mood;
            saveMood(mood);
            highlightMoodButton(button);
        });
    });
}

// Initialize the app
init();