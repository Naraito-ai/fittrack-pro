const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  exerciseName: { type: String, required: true, trim: true, maxlength: 200 },
  weightKg:     { type: Number, default: 0, min: 0 },
  reps:         { type: Number, required: true, min: 1 },
  sets:         { type: Number, required: true, min: 1 },
  volume:       { type: Number, default: 0 },
  muscleGroup:  {
    type: String, default: 'other',
    enum: ['chest','back','shoulders','biceps','triceps','legs','glutes','core','cardio','full_body','other'],
  },
  notes: { type: String, maxlength: 500 },
  date:  { type: Date, required: true, index: true },
}, { timestamps: true });

workoutLogSchema.index({ userId: 1, date: 1 });
workoutLogSchema.index({ userId: 1, exerciseName: 1, date: 1 });

workoutLogSchema.pre('save', function(next) {
  this.volume = Math.round(this.weightKg * this.reps * this.sets * 100) / 100;
  next();
});

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
