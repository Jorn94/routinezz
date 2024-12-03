const routines = {
  morning: [
    { task: "Wake up", time: "5 min" },
    { task: "Brush teeth", time: "3 min" },
    { task: "Workout", time: "30 min" },
    { task: "Breakfast", time: "15 min" }
  ],
  evening: [
    { task: "Dinner", time: "20 min" },
    { task: "Relax", time: "30 min" },
    { task: "Read a book", time: "15 min" },
    { task: "Sleep", time: "8 hrs" }
  ]
};

let currentRoutine = [];
let currentTaskIndex = 0;
let timer = null;
let currentRoutineName = '';
let isPaused = false;

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

// Save routines to localStorage
function saveRoutines() {
  try {
    localStorage.setItem('routines', JSON.stringify(routines));
    showToast('Routine saved successfully!');
  } catch (error) {
    console.error('Error saving routines:', error);
    showToast('Error saving routines');
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
  // Clear previous state
  clearInterval(timer);
  isPaused = false;
  currentTaskIndex = 0;
  
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
  document.getElementById("routine-list").classList.remove("hidden");
  document.getElementById("completion-message").classList.add("hidden");
  clearInterval(timer);
  currentTaskIndex = 0;
}

function startRoutine() {
  currentTaskIndex = 0;
  displayCurrentTask();
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  if (currentTaskIndex >= currentRoutine.length) return;
  
  const timeInMs = parseTime(currentRoutine[currentTaskIndex].time);
  const startTime = Date.now();
  let pausedTime = 0;
  
  updateTimeDisplay(timeInMs);
  
  timer = setInterval(() => {
    if (!isPaused) {
      const elapsed = Date.now() - startTime - pausedTime;
      const remaining = timeInMs - elapsed;
      
      if (remaining <= 0) {
        markTask(currentTaskIndex);
      } else {
        updateTimeDisplay(remaining);
      }
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
  if (!checkbox.checked) {
    checkbox.checked = true;
  }

  const pingSound = document.getElementById("ping-sound");
  if (pingSound) {
    pingSound.currentTime = 0;
    pingSound.play().catch(error => {
      console.error("Error playing ping sound:", error);
    });
  }
  
  if (index === currentTaskIndex) {
    currentTaskIndex++;
    clearInterval(timer);
    if (currentTaskIndex < currentRoutine.length) {
      displayCurrentTask();
      startTimer();
    } else {
      finishRoutine();
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
  document.getElementById("timer-display").textContent = "";
  document.getElementById("completion-message").classList.remove("hidden");
}

function addTask() {
  // Check if a routine is selected
  if (!currentRoutineName) {
    showToast('Please select a routine first!');
    return;
  }

  const taskName = prompt("Enter task name:");
  if (!taskName) return;
  
  const taskTime = prompt("Enter task time (e.g., '5 min' or '1 hrs'):");
  if (!taskTime) return;
  
  // Validate time format
  if (!timeStr.includes('min') && !timeStr.includes('hrs') && !timeStr.includes('sec')) {
    showToast('Invalid time format. Please use "min", "hrs", or "sec"');
    return;
  }
  
  routines[currentRoutineName].push({
    task: taskName,
    time: taskTime
  });
  
  loadRoutine(currentRoutineName);
  showToast('Task added successfully!');
}

function togglePause() {
  isPaused = !isPaused;
  const pauseBtn = document.getElementById('pause-btn');
  pauseBtn.innerHTML = `<i class="fas ${isPaused ? 'fa-play' : 'fa-pause'}"></i> ${isPaused ? 'Resume' : 'Pause'}`;
}

function resetRoutine() {
  clearInterval(timer);
  isPaused = false;
  currentTaskIndex = 0;
  
  // Uncheck all checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => checkbox.checked = false);
  
  // Reset displays
  document.getElementById("timer-display").textContent = "";
  document.getElementById("current-activity").textContent = "";
  document.getElementById("completion-message").classList.add("hidden");
}

// Load saved routines when the page loads
document.addEventListener('DOMContentLoaded', loadSavedRoutines);
