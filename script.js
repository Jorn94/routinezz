const routines = {
  morning: [
    { task: "Wake up", time: "5 min", feeling: "Ready to conquer the day!" },
    { task: "Brush teeth", time: "3 min", feeling: "Fresh and clean, ready to smile!" },
    { task: "Workout", time: "30 min", feeling: "Energized and proud of staying healthy!" },
    { task: "Breakfast", time: "15 min", feeling: "Nourished and ready to start the day!" }
  ],
  evening: [
    { task: "Dinner", time: "20 min", feeling: "Satisfied with a good meal!" },
    { task: "Relax", time: "30 min", feeling: "Peaceful and stress-free..." },
    { task: "Read a book", time: "15 min", feeling: "Enriched and mentally refreshed!" },
    { task: "Sleep", time: "8 hrs", feeling: "Ready for a restful night!" }
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
      <span>${item.task}</span>
      <span>${item.time}</span>
      <input type="checkbox" id="task-${index}" onchange="markTask(${index})">
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
  const taskElement = checkbox.parentElement;
  
  if (!checkbox.checked) {
    checkbox.checked = true;
    
    // Show feeling message
    const feeling = currentRoutine[index].feeling;
    taskElement.innerHTML = `<div class="feeling-text">${feeling || 'Great job completing this task!'}</div>`;
    taskElement.classList.add('completed-task');
    
    const pingSound = document.getElementById("ping-sound");
    if (pingSound) {
      pingSound.currentTime = 0;
      pingSound.play().catch(error => {
        console.error("Error playing ping sound:", error);
      });
    }
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
  
  const pauseBtn = document.getElementById('pause-btn');
  pauseBtn.innerHTML = `<i class="fas fa-pause"></i> Pause`;
  
  // Reset task elements to original state
  currentRoutine.forEach((item, index) => {
    const taskElement = document.getElementById(`task-${index}`).parentElement;
    taskElement.classList.remove('completed-task'); // Remove completed class
    taskElement.innerHTML = `
      <span>${item.task}</span>
      <span>${item.time}</span>
      <input type="checkbox" id="task-${index}" onchange="markTask(${index})">
    `;
  });
  
  document.getElementById("timer-display").textContent = "";
  document.getElementById("current-activity").textContent = "";
  document.getElementById("completion-message").classList.add("hidden");
}

// Load saved routines when the page loads
document.addEventListener('DOMContentLoaded', loadSavedRoutines);
