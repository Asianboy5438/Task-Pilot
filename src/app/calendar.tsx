x<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Assignment Calendar</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      background: #f4f6f8;
    }

    header {
      background: #4a90e2;
      color: white;
      padding: 15px;
      text-align: center;
      font-size: 1.5em;
    }

    .controls {
      padding: 10px;
      background: white;
      display: flex;
      gap: 10px;
      justify-content: center;
      border-bottom: 1px solid #ddd;
    }

    input, button {
      padding: 8px;
      font-size: 14px;
    }

    .calendar {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
      padding: 10px;
    }

    .day {
      background: white;
      min-height: 120px;
      border-radius: 8px;
      padding: 5px;
      display: flex;
      flex-direction: column;
    }

    .day-header {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .task {
      background: #4a90e2;
      color: white;
      padding: 5px;
      margin: 3px 0;
      border-radius: 5px;
      cursor: grab;
    }

    .task.dragging {
      opacity: 0.5;
    }
  </style>
</head>
<body>

<header>📚 Assignment Calendar</header>

<div class="controls">
  <input type="text" id="taskInput" placeholder="Assignment name">
  <input type="date" id="dateInput">
  <button onclick="addTask()">Add</button>
</div>

<div class="calendar" id="calendar"></div>

<script>
  const calendar = document.getElementById("calendar");
  const daysInMonth = 31; // simple version (change if needed)
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  function createCalendar() {
    calendar.innerHTML = "";
    for (let i = 1; i <= daysInMonth; i++) {
      const day = document.createElement("div");
      day.className = "day";
      day.dataset.date = i;

      const header = document.createElement("div");
      header.className = "day-header";
      header.textContent = i;

      day.appendChild(header);

      day.addEventListener("dragover", e => e.preventDefault());
      day.addEventListener("drop", dropTask);

      calendar.appendChild(day);
    }
    renderTasks();
  }

  function addTask() {
    const text = document.getElementById("taskInput").value;
    const date = new Date(document.getElementById("dateInput").value).getDate();

    if (!text || !date) return;

    tasks.push({ text, date });
    saveTasks();
    createCalendar();

    document.getElementById("taskInput").value = "";
  }

  function renderTasks() {
    document.querySelectorAll(".task").forEach(t => t.remove());

    tasks.forEach((task, index) => {
      const taskEl = document.createElement("div");
      taskEl.className = "task";
      taskEl.textContent = task.text;
      taskEl.draggable = true;

      taskEl.addEventListener("dragstart", e => {
        taskEl.classList.add("dragging");
        e.dataTransfer.setData("index", index);
      });

      taskEl.addEventListener("dragend", () => {
        taskEl.classList.remove("dragging");
      });

      const day = document.querySelector(`.day[data-date='${task.date}']`);
      if (day) day.appendChild(taskEl);
    });
  }

  function dropTask(e) {
    const index = e.dataTransfer.getData("index");
    const newDate = e.currentTarget.dataset.date;

    tasks[index].date = parseInt(newDate);
    saveTasks();
    createCalendar();
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  createCalendar();
</script>

</body>
</html>
