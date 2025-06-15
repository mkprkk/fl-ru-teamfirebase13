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
    { field: "paydayDate", test: isRequired, error: messages.required("date") },
  ],
  16: [
    { field: "routingNumber", test: isRoutingNumber, error: messages.routing },
  ],
  18: [
    { field: "accountNumber", test: isAccountNumber, error: messages.account },
  ],
  19: [
    {
      field: "driverId",
      test: isRequired,
      error: messages.required("Driver ID"),
    },
  ],
  21: [{ field: "socialSecurityNumber", test: isSSN, error: messages.ssnFull }],
};

const errorTemplate = document
  .querySelector("#form-error")
  .content.querySelector(".form-error");

// Показ ошибки
function showError(element, message) {
  const container = element;
  let errorElem = container.querySelector(".form-error");
  if (!errorElem) {
    errorElem = errorTemplate.cloneNode(true);
    container.appendChild(errorElem);
  }
  errorElem.textContent = message;
}

// Очистка ошибки
function clearError(element) {
  const container = element;
  container.querySelector(".form-error")?.remove();
}

// Обновление состояния иконки
function updateIconState(
  stepContainer,
  fieldName,
  { add = [], remove = [] } = {}
) {
  let icon;
  if (fieldName) {
    icon = stepContainer.querySelector(
      `.form__label-icon[data-field="${fieldName}"]`
    );
  }
  if (!icon) {
    icon = stepContainer.querySelector(".form__label-icon");
  }
  if (icon) {
    add.forEach((cls) => icon.classList.add(cls));
    remove.forEach((cls) => icon.classList.remove(cls));
  }
}

// Валидация по шагам
// Новая сигнатура: второй параметр — показывать ли ошибки
// универсальный сеттер классов для иконки конкретного поля
function setIconStateForField(stepContainer, field, { add = [], remove = [] }) {
  // 1) Ищем icon с data-field
  let icon = stepContainer.querySelector(`.form__label-icon[data-field="${field}"]`);
  if (!icon) {
    // 2) Ищем input[name=field], поднимаемся к .step-parent и достаём из него .form__label-icon
    const input = stepContainer.querySelector(`[name="${field}"]`);
    const stepParent = input?.closest('.step-parent');
    icon = stepParent?.querySelector('.form__label-icon');
  }
  if (!icon) return;
  icon.classList.remove(...remove);
  icon.classList.add(...add);
}

function validateStep(idx, showErrors = true) {
  const stepContainer = getCurrentStep(idx)[0];
  if (!stepContainer) return true;

  // 1) Найти ВСЕ иконки в шаге
  const allIcons = Array.from(
    stepContainer.querySelectorAll('.form__label-icon')
  );
  // sharedIcon — только если вообще ОДНА иконка
  const sharedIcon = allIcons.length === 1 ? allIcons[0] : null;

  let valid = true;
  const stepValidations = validations[idx];

  // --- Текстовые поля и select ---
  if (stepValidations) {
    for (const { field, test, error } of stepValidations) {
      const input = stepContainer.querySelector(`[name="${field}"]`);
      const value = input?.value.trim();
      const passed = test(value);
      const target = input?.closest("label") || input?.parentElement;

      // Управление сообщением
      if (passed) {
        if (showErrors) clearError(target);
      } else {
        valid = false;
        if (showErrors) showError(target, error);
      }

      // Если sharedIcon — отложить на потом
      if (!sharedIcon) {
        // иначе — per‑field
        if (passed) {
          setIconStateForField(stepContainer, field, {
            add: ["icon--evt-sucess"],
            remove: ["icon--evt-error"],
          });
        } else if (showErrors) {
          setIconStateForField(stepContainer, field, {
            add: ["icon--evt-error"],
            remove: ["icon--evt-sucess"],
          });
        } else {
          // мягкий + провал
          setIconStateForField(stepContainer, field, {
            add: [],
            remove: ["icon--evt-sucess", "icon--evt-error"],
          });
        }
      }
    }
  }

  // --- Группы радио ---
  const radios = stepContainer.querySelectorAll('input[type="radio"][name]');
  const seen = new Set();
  radios.forEach((r) => {
    const name = r.name;
    if (seen.has(name)) return;
    seen.add(name);

    const group = stepContainer.querySelectorAll(`input[name="${name}"]`);
    const isChecked = [...group].some((x) => x.checked);
    const container = r.closest(".form__ul");

    if (isChecked) {
      if (showErrors) clearError(container);
    } else {
      valid = false;
      if (showErrors) showError(container, messages.radio);
    }

    if (!sharedIcon) {
      if (isChecked) {
        setIconStateForField(stepContainer, name, {
          add: ["icon--evt-sucess"],
          remove: ["icon--evt-error"],
        });
      } else if (showErrors) {
        setIconStateForField(stepContainer, name, {
          add: ["icon--evt-error"],
          remove: ["icon--evt-sucess"],
        });
      } else {
        setIconStateForField(stepContainer, name, {
          add: [],
          remove: ["icon--evt-sucess", "icon--evt-error"],
        });
      }
    }
  });

  // --- Обновляем sharedIcon, если он есть ---
  if (sharedIcon) {
    if (valid) {
      sharedIcon.classList.remove("icon--evt-error");
      sharedIcon.classList.add("icon--evt-sucess");
    } else if (showErrors) {
      sharedIcon.classList.remove("icon--evt-sucess");
      sharedIcon.classList.add("icon--evt-error");
    } else {
      sharedIcon.classList.remove("icon--evt-sucess", "icon--evt-error");
    }
  }

  return valid;
}





