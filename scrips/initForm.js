const steps = {
  step1: [
    document.getElementById("step1"),
    "How much do you want to borrow?",
    true,
    "preScreen",
  ],
  step2: [
    document.getElementById("step2"),
    "Let us help you find all available funding options",
    true,
  ],
  step3: [
    document.getElementById("step3"),
    "What is the purpose of this loan?",
    true,
  ],
  step4: [
    document.getElementById("step4"),
    "Where to send the loan confirmation?",
    true,
  ],
  step5: [document.getElementById("step5"), "Please enter your phone #", true],
  step6: [
    document.getElementById("step6"),
    "Please verify your identity.",
    true,
  ],
  step7: [
    document.getElementById("step7"),
    "What is your full legal name?",
    true,
  ],
  step8: [
    document.getElementById("step8"),
    "What is your current residential address?",
    true,
  ],
  step9: [
    document.getElementById("step9"),
    "How long have you lived there?",
    true,
  ],
  step10: [
    document.getElementById("step10"),
    "Do you rent or own your residence?",
    true,
  ],
  step11: [
    document.getElementById("step11"),
    "What is your income type?",
    true,
  ],
  step12: [
    document.getElementById("step12"),
    "Please provide your job information",
    true,
  ],
  step13: [
    document.getElementById("step13"),
    "How long have you been with your current employer?",
    false,
  ],
  step14: [
    document.getElementById("step14"),
    "Please select the next payday date",
    true,
  ],
  step15: [
    document.getElementById("step15"),
    "Please provide your job information",
    true,
    "preScreen",
  ],
  step16: [
    document.getElementById("step16"),
    "Where would you like the funds to be deposited?",
    true,
    "bankDetails",
  ],
  step17: [
    document.getElementById("step17"),
    "How long have you been with IOWA STATE BANK?",
    false,
  ],
  step18: [
    document.getElementById("step18"),
    "Please specify your bank account number",
    true,
  ],
  step19: [
    document.getElementById("step19"),
    "Please verify your identity",
    true,
  ],
  step20: [
    document.getElementById("step20"),
    "Please estimate your credit score",
    false,
  ],
  step21: [
    document.getElementById("step21"),
    "Enter your SSN to complete your request",
    true,
  ],
  step22: [
    document.getElementById("step22"),
    "Now, simply press the “Request Cash” button. You’re all set!",
    true,
    "bankDetails",
  ],
};

const employeeMessage = document.querySelector(".employee__message");
const buttonTemplate = document.querySelector(
  "#continue-button-template"
).content;
const finalButtonTemplate = document.querySelector(
  "#final-button-template"
).content;

let currentStepIdx = 1;
const formData = {};

// === Step Functions ===

function getCurrentStep(idx) {
  return steps[`step${idx}`];
}

function getStepForm(step) {
  return step[0].querySelector("form");
}

function hideAllSteps() {
  Object.values(steps).forEach(([element]) => {
    element.classList.add("hidden");
    element.classList.remove("active");
  });
}

// === Data Collection ===

function collectStepData(idx) {
  const form = getStepForm(getCurrentStep(idx));
  if (!form || !form.elements) return;

  Array.from(form.elements).forEach((el) => {
    if (!el.name || (el.type === "radio" && !el.checked)) return;
    formData[el.name] = el.value;
  });
}

function addRadioChangeListeners(form, idx) {
  const radios = form.querySelectorAll('input[type="radio"]');
  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!validateStep(idx)) return;
      collectStepData(idx);
      goToNextStep();
    });
  });
}

// === Navigation ===

function goToNextStep() {
  initStep(++currentStepIdx);
  if (currentStepIdx === 22) {
    finishForm();
  }
}

function finishForm() {
  console.log("Форма закончилась", formData);
}

// === Buttons ===

function addButtonToStep(stepElem, idx) {
  const isFinalStep = currentStepIdx === 22;
  const btn = isFinalStep
    ? finalButtonTemplate.querySelector(".button").cloneNode(true)
    : buttonTemplate.querySelector(".button").cloneNode(true);

  btn.classList.add("continue-btn");

  btn.addEventListener("click", () => {
    if (!validateStep(idx)) return;

    if (currentStepIdx === 4) {
      emailModal(formData.email, idx);
    } else {
      collectStepData(idx);
      goToNextStep();
    }
  });

  stepElem.append(btn);
}

function addEnterKeyHandler(form, stepElem) {
  form?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const tag = e.target.tagName.toLowerCase();
    if (tag === "textarea" || tag === "button") return;

    e.preventDefault();

    const continueBtn = stepElem.querySelector(".continue-btn");
    if (continueBtn) continueBtn.click();
  });
}

// === Email Modal ===

function emailModal(email, idx) {
  collectStepData(idx);
  const dialog = document.getElementById("emailDialog");
  dialog.querySelector(".email").textContent = email;

  const confirmBtn = dialog.querySelector(".email-dialog__button-confirm");
  const editBtn = dialog.querySelector(".email-dialog__button-edit");

  function confirmHandler() {
    collectStepData(idx);
    goToNextStep();
    cleanup();
    dialog.close();
  }

  function editHandler() {
    delete formData.email;
    cleanup();
    dialog.close();
  }

  function cleanup() {
    confirmBtn.removeEventListener("click", confirmHandler);
    editBtn.removeEventListener("click", editHandler);
    dialog.removeEventListener("close", cleanup);
  }

  confirmBtn.addEventListener("click", confirmHandler);
  editBtn.addEventListener("click", editHandler);
  dialog.addEventListener("close", cleanup);

  dialog.showModal();
}

// === Group Progress Logic ===

function getGroupRanges(steps) {
  const borders = {};
  Object.entries(steps).forEach(([id, step]) => {
    const group = step[3];
    if (group) {
      const idx = parseInt(id.replace(/\D/g, ""), 10);
      if (!borders[group]) borders[group] = { min: idx, max: idx };
      else {
        borders[group].min = Math.min(borders[group].min, idx);
        borders[group].max = Math.max(borders[group].max, idx + 1);
      }
    }
  });

  const lastGroup = Object.keys(borders).at(-1);
  if (lastGroup) borders[lastGroup].max -= 1;

  return borders;
}

function updateProgressBars(idx, ranges) {
  const groupOrder = Object.keys(ranges).sort(
    (a, b) => ranges[a].min - ranges[b].min
  );

  const currentGroupIdx = groupOrder.findIndex((name) => {
    const { min, max } = ranges[name];
    return idx >= min && idx <= max;
  });

  groupOrder.forEach((name, i) => {
    const bar = document.querySelector(`.progress[data-group="${name}"]`);
    if (!bar) return;

    const { min, max } = ranges[name];
    let progress = 0;

    if (i < currentGroupIdx) progress = 100;
    else if (i === currentGroupIdx)
      progress = ((idx - min) / (max - min)) * 100;

    const percentElem = bar.querySelector(".progress-procent");
    const fill = bar.querySelector(".progress-bar");

    if (percentElem) {
      percentElem.textContent =
        progress >= 100 ? "✔" : `${Math.round(progress)}%`;
    }
    if (fill) fill.style.transform = `scaleX(${progress / 100})`;
  });
}

function updateGroupVisibility(ranges, currentIdx) {
  const groupOrder = Object.keys(ranges).sort(
    (a, b) => ranges[a].min - ranges[b].min
  );
  let visibleCount = 0;

  groupOrder.forEach((groupName) => {
    const group = document.querySelector(
      `.progress[data-group="${groupName}"]`
    );
    if (!group) return;

    const { min } = ranges[groupName];
    const isVisible = currentIdx >= min;

    if (isVisible) {
      group.classList.remove("hidden-group");
      visibleCount++;
    } else {
      group.classList.add("hidden-group");
    }
  });

  // Назначить одинаковую ширину всем видимым .progress
  const all = document.querySelectorAll(`.progress-container .progress`);
  all.forEach((el) => {
    if (!el.classList.contains("hidden-group")) {
      el.style.width = `${100 / visibleCount}%`;
    } else {
      el.style.width = "0";
    }
  });
}

// === Step Initialization ===

function initStep(idx) {
  const step = getCurrentStep(idx);
  if (!step) return false;

  hideAllSteps();
  step[0].classList.remove("hidden");
  step[0].classList.add("active");

  employeeMessage.textContent = step[1];

  const form = getStepForm(step);
  const oldBtn = step[0].querySelector(".button.continue-btn");
  if (oldBtn) oldBtn.remove();

  if (step[2] !== false) {
    addButtonToStep(step[0], idx);
  } else {
    addRadioChangeListeners(form, idx);
  }

  form?.addEventListener("change", () => validateStep(idx));

  addEnterKeyHandler(form, step[0]);

  const ranges = getGroupRanges(steps);
  updateProgressBars(idx, ranges);
  updateGroupVisibility(ranges, idx);

  return true;
}

// === Start ===

initStep(currentStepIdx);
