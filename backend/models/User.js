const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true, trim: true,
    minlength: 3, maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, underscores'],
  },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  password:            { type: String, required: true, minlength: 6, select: false },
  bodyWeight:          { type: Number, min: 20, max: 500 },
  fitnessGoal:         { type: String, enum: ['bulking','cutting','recomposition','maintenance'], default: 'maintenance' },
  dailyCalorieTarget:  { type: Number, default: 2000, min: 500, max: 10000 },
  proteinTarget:       { type: Number, default: 150 },
  fatTarget:           { type: Number, default: 65 },
  carbTarget:          { type: Number, default: 250 },
  height:              { type: Number },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
