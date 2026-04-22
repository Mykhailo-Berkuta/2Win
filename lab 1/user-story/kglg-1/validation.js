// ============================================================
//  Registration Form Validation
// ============================================================

// --- Helper Functions ---

function isValidEmail(email) {
  return /^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i.test(email);
}

function calcAge(birthdate, today) {
  const diff = today - new Date(birthdate);
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function calcPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)        score += 1; // довжина
  if (/\d/.test(password))         score += 1; // є цифра
  if (/[A-Z]/.test(password))      score += 1; // є велика літера
  if (/[^a-zA-Z0-9]/.test(password)) score += 1; // є спецсимвол
  return score; // 0 – weak | 1 – fair | 2 – good | 3-4 – strong
}

// --- UI helpers (замінити на реальну логіку в твоєму проєкті) ---

function showError(field, msg) {
  const el = document.getElementById(`error-${field}`);
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
  } else {
    console.error(`[${field}]: ${msg}`);
  }
}

function showSuccess(msg) {
  console.log(`✅ ${msg}`);
  // alert(msg); // або твій toast/modal
}

function redirectTo(path) {
  window.location.href = path;
}

// --- Main Validation Function ---

async function validateRegistrationForm(formData) {

  // 1. Валідація Email
  const email = formData.email.trim();
  if (!isValidEmail(email)) {
    showError("email", "Введіть коректний email");
    return false;
  }

  // 2. Валідація Пароля
  const password = formData.password;
  if (password.length < 8) {
    showError("password", "Мінімум 8 символів");
    return false;
  }
  if (!/\d/.test(password)) {
    showError("password", "Потрібна хоча б 1 цифра");
    return false;
  }

  // 3. Валідація Віку (18+, вимога C-02 SRS)
  const birthdate = new Date(formData.birthdate);
  const age = calcAge(birthdate, new Date());
  if (age < 18) {
    showError("birthdate", "Мінімальний вік: 18 років");
    return false;
  }

  // 4. Checkbox підтвердження
  if (!formData.termsAccepted) {
    showError("terms", "Прийміть умови використання");
    return false;
  }
  if (!formData.age18Confirmed) {
    showError("age18", "Підтвердіть вік 18+");
    return false;
  }

  // 5. Успіх → відправка на сервер
  // ⚠️  bcrypt НІКОЛИ не робиться на клієнті — пароль хешує сервер.
  //     Передаємо пароль по HTTPS, сервер (C#/Node) сам зробить bcrypt.
  const payload = {
    email,
    password,           // сервер захешує
    birthdate: formData.birthdate,
  };

  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.status === 201) {
    showSuccess("Акаунт створено! Перевірте email.");
    redirectTo("/dashboard");
  } else if (response.status === 409) {
    showError("email", "Email вже зареєстрований");
  }

  return true;
}

