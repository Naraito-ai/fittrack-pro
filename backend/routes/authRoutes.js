const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('username').trim().isLength({ min:3, max:30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], login);

router.get('/me',               protect, getMe);
router.put('/me',               protect, updateMe);
router.put('/change-password',  protect, changePassword);

module.exports = router;
