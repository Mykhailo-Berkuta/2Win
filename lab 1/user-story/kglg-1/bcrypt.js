const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const BCRYPT_SALT_ROUNDS = 12; // 2^12 = 4096 ітерацій (~250ms)
const MIN_PASSWORD_LEN = 8;
const JWT_SECRET = process.env.JWT_SECRET;

// ─── Хешування при реєстрації ───
async function hashPassword(plainPassword) {
  if (plainPassword.length < MIN_PASSWORD_LEN) {
    throw new Error('Пароль занадто короткий');
  }

  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  const hash = await bcrypt.hash(plainPassword, salt);
  // Результат: "$2b$12$<22-char-salt><31-char-hash>" (60 символів)
  return hash;
}

// ─── Перевірка при логіні ───
async function verifyPassword(plainPassword, storedHash) {
  // bcrypt сам витягує сіль зі storedHash — порівнює безпечно
  const isMatch = await bcrypt.compare(plainPassword, storedHash);
  return isMatch; // true / false
}

// ─── Endpoint POST /api/auth/register ───
router.post('/register', async (req, res) => {
  const { email, password, birthdate } = req.body;

  try {
    validateEmail(email);       // власна функція валідації
    validatePassword(password); // власна функція валідації
    validateAge(birthdate);     // C-02: 18+

    const passwordHash = await hashPassword(password);
    const userId = await db.createUser({ email, passwordHash, birthdate });
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });

    return res.status(201).json({ userId, token });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// ─── Endpoint POST /api/auth/login ───
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await db.findByEmail(email);
  if (!user) {
    // НЕ "Email не знайдено" — не розкриваємо яке поле невірне
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
  return res.status(200).json({ token });
});

module.exports = router;