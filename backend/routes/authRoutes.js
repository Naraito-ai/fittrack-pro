const express = require('express');
const { body } = require('express-validator');

const {
  register,
  login,
  getMe,
  updateMe,
  changePassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

const router = express.Router();

/* ===============================
   REGISTER USER
================================ */

router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3–30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, underscore'),

    body('email')
      .isEmail()
      .withMessage('Valid email required')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  register
);

/* ===============================
   LOGIN USER
================================ */

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email required')
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('Password required'),
  ],
  login
);

/* ===============================
   GET CURRENT USER
================================ */

router.get('/me', protect, getMe);

/* ===============================
   UPDATE PROFILE
================================ */

router.put('/me', protect, updateMe);

/* ===============================
   CHANGE PASSWORD
================================ */

router.put('/change-password', protect, changePassword);

module.exports = router;