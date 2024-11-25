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

function loadRoutine(name) {
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
}

function startRoutine() {
  currentTaskIndex = 0;
  displayCurrentTask();
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
  const pingSound = document.getElementById("ping-sound");
  pingSound.play();
  if (index === currentTaskIndex) {
    currentTaskIndex++;
    displayCurrentTask();
  }
}

function finishRoutine() {
  const clapSound = document.getElementById("clap-sound");
  clapSound.play();
  document.getElementById("current-activity").textContent = "";
  document.getElementById("completion-message").classList.remove("hidden");
}
