const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendAuth = (res, status, user) => {
  const token = signToken(user._id);
  const u = user.toObject();
  delete u.password;
  res.status(status).json({ success: true, token, user: u });
};

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { username, email, password, fitnessGoal,
            dailyCalorieTarget, proteinTarget, fatTarget, carbTarget } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      const field = exists.email === email ? 'email' : 'username';
      return res.status(409).json({ success: false, message: `${field} already registered` });
    }

    const user = await User.create({
      username, email, password,
      fitnessGoal:        fitnessGoal        || 'maintenance',
      dailyCalorieTarget: dailyCalorieTarget || 2000,
      proteinTarget:      proteinTarget      || 150,
      fatTarget:          fatTarget          || 65,
      carbTarget:         carbTarget         || 250,
    });

    sendAuth(res, 201, user);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    sendAuth(res, 200, user);
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => res.json({ success: true, user: req.user });

exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ['username','bodyWeight','fitnessGoal',
                     'dailyCalorieTarget','proteinTarget','fatTarget','carbTarget','height'];
    const update = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Valid current and new password (min 6 chars) required' });

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
};
