const routines = {
  morning: [
    { 
      task: "Hydrate", 
      time: "5 min", 
      feeling: "Hydrating my body shows I care for my health and sets the tone for a productive day."
    },
    { 
      task: "Stretch or Move", 
      time: "10 min", 
      feeling: "Moving my body is an act of strength and vitality, making me feel strong and alive."
    },
    { 
      task: "Meditate", 
      time: "10 min", 
      feeling: "Taking this time to meditate reflects my commitment to mental clarity and inner peace."
    },
    { 
      task: "Gratitude", 
      time: "5 min", 
      feeling: "Focusing on gratitude highlights my ability to see the good in life and stay positive."
    },
    { 
      task: "Set 3 Goals for Today", 
      time: "5 min", 
      feeling: "Setting goals shows how focused and determined I am to make the most of my day."
    }
  ],
  evening: [
    { 
      task: "Brush Teeth", 
      time: "5 min", 
      feeling: "Caring for my hygiene reflects my self-respect and commitment to well-being."
    },
    { 
      task: "Read 10 Pages", 
      time: "15 min", 
      feeling: "Expanding my mind and learning new things shows how dedicated I am to growth."
    },
    { 
      task: "Visualize Goals Achieved", 
      time: "10 min", 
      feeling: "Visualizing my success proves how ambitious and capable I am of achieving great things."
    }
  ]
};

let currentRoutine = [];
let currentTaskIndex = 0;
let timer = null;
let currentRoutineName = '';
let isPaused = false;
let totalRoutineTime = 0;

// Load saved routines from localStorage
function loadSavedRoutines() {
  try {
    const savedRoutines = localStorage.getItem('routines');
    if (savedRoutines) {
      Object.assign(routines, JSON.parse(savedRoutines));
    }
  } catch (error) {
    console.error('Error loading saved routines:', error);
    showToast('Error loading saved routines');
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function parseTime(timeStr) {
  const number = parseFloat(timeStr);
  if (timeStr.includes('hrs')) return number * 60 * 60 * 1000;
  if (timeStr.includes('min')) return number * 60 * 1000;
  if (timeStr.includes('sec')) return number * 1000;
  return number * 60 * 1000; // default to minutes
}

function loadRoutine(name) {
  currentRoutineName = name;
  currentRoutine = routines[name];
  const routineItems = document.getElementById("routine-items");
  routineItems.innerHTML = "";
  
  currentRoutine.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="task-content">
        <span>${item.task}</span>
        <span>${item.time}</span>
        <input type="checkbox" id="task-${index}" onchange="markTask(${index})">
      </div>
      <button class="delete-btn" onclick="deleteTask(${index})">×</button>
    `;
    routineItems.appendChild(li);
  });

  // Add the + symbol
  const addTaskLi = document.createElement("li");
  addTaskLi.className = "add-task-button";
  addTaskLi.innerHTML = `<button onclick="addTask()">+</button>`;
  routineItems.appendChild(addTaskLi);

  document.getElementById("routine-list").classList.remove("hidden");
  document.getElementById("completion-message").classList.add("hidden");
  document.getElementById("timer-display").textContent = "";
}

function startRoutine() {
  currentTaskIndex = 0;
  isPaused = false;
  document.getElementById("timer-display").classList.remove("hidden");
  displayCurrentTask();
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  if (currentTaskIndex >= currentRoutine.length) return;
  
  const timeInMs = parseTime(currentRoutine[currentTaskIndex].time);
  const startTime = Date.now();
  let pausedTime = 0;
  let lastPauseStart = 0;
  
  updateTimeDisplay(timeInMs);
  
  timer = setInterval(() => {
    if (!isPaused) {
      if (lastPauseStart) {
        pausedTime += Date.now() - lastPauseStart;
        lastPauseStart = 0;
      }
      
      const elapsed = Date.now() - startTime - pausedTime;
      const remaining = timeInMs - elapsed;
      
      if (remaining <= 0) {
        markTask(currentTaskIndex);
      } else {
        updateTimeDisplay(remaining);
      }
    } else if (!lastPauseStart) {
      lastPauseStart = Date.now();
    }
  }, 1000);
}

function updateTimeDisplay(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  document.getElementById("timer-display").textContent = 
    `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function displayCurrentTask() {
  const currentActivity = document.getElementById("current-activity");
  if (currentTaskIndex < currentRoutine.length) {
    currentActivity.textContent = `Current Task: ${currentRoutine[currentTaskIndex].task}`;
  } else {
    finishRoutine();
  }
}

function markTask(index) {
  const checkbox = document.getElementById(`task-${index}`);
  const taskElement = checkbox.parentElement.parentElement;
  
  if (checkbox.checked) {
    const feeling = currentRoutine[index].feeling;
    taskElement.innerHTML = `
      <div class="feeling-text">${feeling || 'Great job completing this task!'}</div>
      <button class="delete-btn" onclick="deleteTask(${index})">×</button>
    `;
    taskElement.classList.add('completed-task');
    
    const pingSound = document.getElementById("ping-sound");
    if (pingSound) {
      pingSound.currentTime = 0;
      pingSound.play().catch(error => {
        console.error("Error playing ping sound:", error);
      });
    }
  } else {
    taskElement.classList.remove('completed-task');
    taskElement.innerHTML = `
      <div class="task-content">
        <span>${currentRoutine[index].task}</span>
        <span>${currentRoutine[index].time}</span>
        <input type="checkbox" id="task-${index}" onchange="markTask(${index})" ${checkbox.checked ? 'checked' : ''}>
      </div>
      <button class="delete-btn" onclick="deleteTask(${index})">×</button>
    `;
  }
  
  if (index === currentTaskIndex) {
    currentTaskIndex++;
    clearInterval(timer);
    
    if (currentTaskIndex >= currentRoutine.length) {
      finishRoutine();
    } else {
      displayCurrentTask();
      startTimer();
    }
  }
}

function finishRoutine() {
  clearInterval(timer);
  const clapSound = document.getElementById("clap-sound");
  if (clapSound) {
    clapSound.currentTime = 0;
    clapSound.play().catch(error => {
      console.error("Error playing clap sound:", error);
    });
  }
  document.getElementById("current-activity").textContent = "";
  document.getElementById("completion-message").classList.remove("hidden");
}

function addTask() {
  if (!currentRoutineName) {
    showToast('Please select a routine first!');
    return;
  }
  document.getElementById('add-task-modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('add-task-modal').style.display = 'none';
}

function submitNewTask() {
  const taskName = document.getElementById('task-name').value;
  const taskMinutes = document.getElementById('task-time').value;
  const taskFeeling = document.getElementById('task-feeling').value;
  
  if (!taskName || !taskMinutes || !taskFeeling) {
    showToast('Please fill in all fields');
    return;
  }
  
  routines[currentRoutineName].push({
    task: taskName,
    time: `${taskMinutes} min`,
    feeling: taskFeeling
  });
  
  closeModal();
  loadRoutine(currentRoutineName);
  saveRoutines();
  
  // Clear the form
  document.getElementById('task-name').value = '';
  document.getElementById('task-time').value = '';
  document.getElementById('task-feeling').value = '';
}

function togglePause() {
  isPaused = !isPaused;
  const pauseBtn = document.getElementById('pause-btn');
  pauseBtn.innerHTML = `<i class="fas ${isPaused ? 'fa-play' : 'fa-pause'}"></i> ${isPaused ? 'Resume' : 'Pause'}`;
  
  if (isPaused) {
    document.getElementById("current-activity").textContent += " (PAUSED)";
  } else {
    displayCurrentTask();
  }
}

function resetRoutine() {
  clearInterval(timer);
  isPaused = false;
  currentTaskIndex = 0;
  
  // Reset pause button
  const pauseBtn = document.getElementById('pause-btn');
  pauseBtn.innerHTML = `<i class="fas fa-pause"></i> Pause`;
  
  // Reload the entire routine to reset all tasks
  loadRoutine(currentRoutineName);
  
  // Clear displays
  document.getElementById("timer-display").textContent = "";
  document.getElementById("current-activity").textContent = "";
  document.getElementById("completion-message").classList.add("hidden");
}

function deleteTask(index) {
  if (confirm('Are you sure you want to delete this task?')) {
    routines[currentRoutineName].splice(index, 1);
    loadRoutine(currentRoutineName);
    saveRoutines();
    showToast('Task deleted');
  }
}

// Load saved routines when the page loads
document.addEventListener('DOMContentLoaded', loadSavedRoutines);
