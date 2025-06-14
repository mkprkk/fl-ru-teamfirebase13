document.addEventListener('DOMContentLoaded', function () {
  const dobInput = document.querySelector('input[name="dateOfBirth"]');

  dobInput.addEventListener('input', function (e) {
    let value = dobInput.value.replace(/\D/g, ''); // убираем всё, кроме цифр

    if (value.length > 8) value = value.slice(0, 8); // максимум 8 цифр

    let formatted = '';
    if (value.length > 0) {
      formatted += value.substring(0, 2); // MM
    }
    if (value.length > 2) {
      formatted += ' / ' + value.substring(2, 4); // DD
    }
    if (value.length > 4) {
      formatted += ' / ' + value.substring(4); // YYYY
    }

    dobInput.value = formatted;
  });
});

 document.getElementById('ssnInput').addEventListener('input', function(e) {
    // Удаляем все нецифровые символы
    let value = e.target.value.replace(/\D/g, '');
    
    // Добавляем дефисы в нужных позициях
    if (value.length > 3 && value.length <= 5) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 5) {
      value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5, 9);
    }
    
    // Обновляем значение в инпуте
    e.target.value = value;
  });

  // Обработка клавиш для лучшего UX
  document.getElementById('ssnInput').addEventListener('keydown', function(e) {
    // Разрешаем: backspace, delete, tab, escape, enter
    if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
      // Разрешаем: Ctrl+A, Ctrl+C, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Разрешаем: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    
    // Запрещаем все, что не цифра
    if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  });
