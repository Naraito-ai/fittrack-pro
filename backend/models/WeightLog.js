const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  bodyWeight:        { type: Number, required: true, min: 20, max: 500 },
  date:              { type: Date, required: true, index: true },
  note:              { type: String, maxlength: 300 },
  bodyFatPercentage: { type: Number, min: 1, max: 70 },
}, { timestamps: true });

weightLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('WeightLog', weightLogSchema);
