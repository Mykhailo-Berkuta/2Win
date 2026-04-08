const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;

// ─── Допоміжна: валідація формату ISO 8601 ───
function isValidISO8601(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const parsed = new Date(dateStr);
  return !isNaN(parsed.getTime());
}

// ─── Допоміжна: точний вік у повних роках ───
function calculateAge(birthdate, today = new Date()) {
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();

  const hasNotHadBirthdayYet =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());

  if (hasNotHadBirthdayYet) {
    age -= 1;
  }

  return age;
}

// ─── ENDPOINT POST /api/auth/register ───
router.post('/register', async (req, res) => {
  const { email, password, birthdate } = req.body;

  // Крок 1: перевірити наявність поля
  if (!birthdate || birthdate.trim() === '') {
    return res.status(400).json({ error: 'birthdate_required' });
  }

  // Крок 2: валідація формату (ISO 8601)
  if (!isValidISO8601(birthdate)) {
    return res.status(400).json({
      error: 'invalid_date_format',
      expected: 'YYYY-MM-DD',
    });
  }

  // Крок 3: розрахунок точного віку
  const age = calculateAge(birthdate, new Date());

  // Крок 4: перевірка мінімального віку (C-02 SRS)
  if (age < 18) {
    return res.status(403).json({
      error: 'underage',
      message: 'Доступ дозволено лише особам 18+ років',
      min_age: 18,
      current_age: age,
    });
  }

  // Крок 5: хешувати пароль, зберегти, видати JWT
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const userId = await db.insertUser({
    email,
    passwordHash,
    birthdate,
    createdAt: new Date(),
  });

  const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });

  return res.status(201).json({
    userId,
    token,
    message: 'Акаунт створено',
  });
});

module.exports = router;