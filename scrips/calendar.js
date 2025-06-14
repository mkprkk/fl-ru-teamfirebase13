const today = new Date();
today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = null;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthFirstAndLastDay() {
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  return { firstDay, lastDay };
}

function renderMonthYearHeader() {
  const monthYear = document.getElementById("month-year");
  monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
}

function renderWeekdayHeaders(grid) {
  daysOfWeek.forEach((day) => {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day header";
    dayEl.textContent = day;
    grid.appendChild(dayEl);
  });
}

function renderEmptyDays(startDay, grid) {
  for (let i = 0; i < startDay; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day empty";
    grid.appendChild(emptyDay);
  }
}

function handleDayClick(dayEl, date) {
  dayEl.addEventListener("click", () => {
    if (selectedDate) {
      document.querySelector(".selected")?.classList.remove("selected");
    }
    dayEl.classList.add("selected");
    selectedDate = date;
    const hiddenInput = document.getElementById("paydayDate");
    hiddenInput.value = selectedDate.toLocaleDateString();
  });
}

function renderMonthDays(daysInMonth, grid) {
  for (let i = 1; i <= daysInMonth; i++) {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";
    dayEl.textContent = i;

    const date = new Date(currentYear, currentMonth, i);

    if (date < today) {
      dayEl.classList.add("disabled");
    } else {
      handleDayClick(dayEl, date);
    }

    grid.appendChild(dayEl);
  }
}

function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  renderMonthYearHeader();
  renderWeekdayHeaders(grid);

  const { firstDay, lastDay } = getMonthFirstAndLastDay();
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Adjust for Mon-Sun
  const daysInMonth = lastDay.getDate();

  renderEmptyDays(startDay, grid);
  renderMonthDays(daysInMonth, grid);
}

function adjustMonth(offset) {
  currentMonth += offset;

  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
}

function prevMonth() {
  adjustMonth(-1);
  renderCalendar();
}

function nextMonth() {
  adjustMonth(1);
  renderCalendar();
}

// Initial rendering
renderCalendar();
