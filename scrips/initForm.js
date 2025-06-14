const steps = {
  step1: [
    document.getElementById("step1"),
    "How much do you want to borrow?",
    true,
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
  ],
  step16: [
    document.getElementById("step16"),
    "Where would you like the funds to be deposited?",
    true,
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
  ],
};

const employeeMessage = document.querySelector(".employee__message");
const buttonTemplate = document.querySelector(
  "#continue-button-template"
).content;
const finalButtonTemplate = document.querySelector(
  "#final-button-template"
).content;
const formData = {};

let currentStepIdx = 1;
function getStepForm(step) {
  return step[0].querySelector("form");
}

function collectStepData(idx) {
  const currentForm = getStepForm(getCurrentStep(idx));
  if (!currentForm || !currentForm.elements) {
    console.warn("Форма не найдена или не содержит элементов");
    return;
  }

  const elements = Array.from(currentForm.elements);
  elements.forEach((el) => {
    if (!el.name) return;
    if (el.type === "radio" && !el.checked) return;
    formData[el.name] = el.value;
  });
}

function hideSteps() {
  Object.values(steps).forEach((element) => {
    element[0].classList.add("hidden");
    element[0].classList.remove("active");
  });
}

function getCurrentStep(idx) {
  const stepKey = `step${idx}`;
  return steps[stepKey];
}

function addButton(stepElem, idx) {
  const btn = buttonTemplate.querySelector(".button").cloneNode(true);
  btn.classList.add("continue-btn");
  btn.addEventListener("click", () => {
    if (!validateStep(idx)) return;

    if (currentStepIdx === 4) {
      emailModal(formData.email, idx);
      return;
    }
    collectStepData(idx);
    initStep(++currentStepIdx);
  });

  stepElem.append(btn);
}

function emailModal(email, idx) {
  collectStepData(idx);
  const emailDialog = document.getElementById("emailDialog");
  emailDialog.querySelector(".email").textContent = email;
  const confirmButton = emailDialog.querySelector(
    ".email-dialog__button-confirm"
  );
  const editButton = emailDialog.querySelector(".email-dialog__button-edit");

  function confirmHandler() {
    collectStepData(idx);
    if (!initStep(++currentStepIdx)) {
      initStep(0);
      console.log("Форма закончилась", formData);
    }
    cleanup();
    emailDialog.close();
  }

  function editHandler() {
    delete formData.email;
    cleanup();
    emailDialog.close();
  }

  function cleanup() {
    confirmButton.removeEventListener("click", confirmHandler);
    editButton.removeEventListener("click", editHandler);
  }

  confirmButton.addEventListener("click", confirmHandler);
  editButton.addEventListener("click", editHandler);

  emailDialog.addEventListener("close", cleanup);

  return emailDialog.showModal();
}

function addRadioChangeListeners(form, idx) {
  const radios = form.querySelectorAll('input[type="radio"]');
  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!validateStep(idx)) return;
      collectStepData(idx);
      if (!initStep(++currentStepIdx)) {
        initStep(0);
        console.log("Форма закончилась", formData);
      }
    });
  });
}

function initStep(idx) {
  const step = getCurrentStep(idx);
  if (!step) {
    console.warn(`Шаг step${idx} не найден`);
    return false;
  }

  hideSteps();

  const currentForm = getStepForm(step);

  step[0].classList.remove("hidden");
  step[0].classList.add("active");
  employeeMessage.textContent = step[1];

  const oldBtn = step[0].querySelector(".button.continue-btn");
  if (oldBtn) oldBtn.remove();

  if (step[2] !== false) {
    addButton(step[0], idx);
  } else {
    addRadioChangeListeners(currentForm, idx);
  }

  currentForm.addEventListener("change", () => {
    validateStep(idx);
  });

  return true;
}

initStep(currentStepIdx);
