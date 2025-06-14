// Общие валидаторы
const isRequired = (value) => value.length > 0;
const isEmail = (value) => /^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(value);
const isPhone = (value) => /^\d{10}$/.test(value.replace(/\D/g, ""));
const isSSNLast4 = (value) => /^\d{4}$/.test(value);
const isSSN = (value) => /^\d{3}-\d{2}-\d{4}$/.test(value);
const isZipCode = (value) => /^\d{5}$/.test(value);
const isDOB = (value) => /^\d{2} ?\/ ?\d{2} ?\/ ?\d{4}$/.test(value);
const isRoutingNumber = (value) => /^\d{9}$/.test(value);
const isAccountNumber = (value) => value.length >= 4 && value.length <= 30;

// Шаблон сообщений об ошибке
const messages = {
  required: (field) => `Please enter your ${field}.`,
  email: "Please enter a valid email address.",
  phone: "Please enter a valid 10-digit phone number.",
  ssn: "Please enter last 4 digits of your SSN.",
  ssnFull: "Please enter a valid SSN in XXX-XX-XXXX format.",
  dob: "Please enter date of birth in MM / DD / YYYY format.",
  zip: "Please enter a valid 5-digit zip code.",
  routing: "Please enter a valid 9-digit routing number.",
  account: "Account number must be 4 to 30 digits.",
  radio: "Please select an option.",
};

// Валидации по шагам
const validations = {
  4: [{ field: "email", test: isEmail, error: messages.email }],
  5: [{ field: "phone", test: isPhone, error: messages.phone }],
  6: [{ field: "ssnLast4", test: isSSNLast4, error: messages.ssn }],
  7: [
    {
      field: "firstName",
      test: isRequired,
      error: messages.required("first name"),
    },
    {
      field: "lastName",
      test: isRequired,
      error: messages.required("last name"),
    },
    { field: "dateOfBirth", test: isDOB, error: messages.dob },
  ],
  8: [
    { field: "zipCode", test: isZipCode, error: messages.zip },
    {
      field: "streetAddress",
      test: isRequired,
      error: messages.required("street address"),
    },
  ],
  12: [
    {
      field: "employerName",
      test: isRequired,
      error: messages.required("employer name"),
    },
    {
      field: "jobTitle",
      test: isRequired,
      error: messages.required("job title"),
    },
    { field: "workPhone", test: isPhone, error: messages.phone },
  ],
  14: [
    {
      field: "paydayDate",
      test: isRequired,
      error: messages.required("date"),
    },
  ],
  16: [
    { field: "routingNumber", test: isRoutingNumber, error: messages.routing },
  ],
  18: [
    { field: "accountNumber", test: isAccountNumber, error: messages.account },
  ],
  21: [
    { 
      field: "socialSecurityNumber", 
      test: isSSN, 
      error: messages.ssnFull 
    }
  ],
};

const errorTemplate = document
  .querySelector("#form-error")
  .content.querySelector(".form-error");

// Показ ошибки
function showError(element, message) {
  const container =
    element.closest("label") || element.parentElement || element;
  let errorElem = container.querySelector(".form-error");
  if (!errorElem) {
    errorElem = errorTemplate.cloneNode(true);
    container.appendChild(errorElem);
  }
  errorElem.textContent = message;
  updateIconState(currentStepIdx, { add: ["icon--evt-error"] });
}

// Очистка ошибки
function clearError(element) {
  const container =
    element.closest("label") || element.parentElement || element;
  container.querySelector(".form-error")?.remove();
}

// Валидация по шагам
function validateStep(idx) {
  const currentForm = getStepForm(getCurrentStep(idx));
  if (!currentForm) return true;

  let valid = true;

  const stepValidations = validations[idx];
  if (stepValidations) {
    for (const { field, test, error } of stepValidations) {
      const input = currentForm.elements[field];
      const value = input?.value.trim();
      if (!test(value)) {
        showError(input, error);
        valid = false;
      }
    }
  }

  // Проверка radio
  const radioGroups = currentForm.querySelectorAll('input[type="radio"][name]');
  if (radioGroups.length) {
    const name = radioGroups[0].name;
    if (!currentForm.elements[name].value) {
      showError(getCurrentStep(idx)[0], "Please select an option.");
      return false;
    }
  }

  if (valid) {
    updateIconState(idx, { add: ["icon--evt-sucess"] });
    clearError(getCurrentStep(idx)[0]);
  } else {
    updateIconState(idx, { remove: ["icon--evt-sucess"] });
  }

  return valid;
}

// Универсальная функция для управления классами иконки
function updateIconState(idx, { add = [], remove = [] } = {}) {
  const currentForm = getStepForm(getCurrentStep(idx));
  const icon = currentForm?.querySelector(".form__label-icon");
  if (!icon) return;

  add.forEach((cls) => icon.classList.add(cls));
  remove.forEach((cls) => icon.classList.remove(cls));
}
