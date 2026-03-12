const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  foodName: { type: String, required: true, trim: true, maxlength: 200 },
  calories: { type: Number, required: true, min: 0 },
  protein:  { type: Number, default: 0, min: 0 },
  fats:     { type: Number, default: 0, min: 0 },
  carbs:    { type: Number, default: 0, min: 0 },
  quantity: { type: Number, default: 1, min: 0.1 },
  unit:     { type: String, default: 'serving', enum: ['serving','g','ml','oz','cup','tbsp','tsp','piece'] },
  mealType: { type: String, default: 'snack', enum: ['breakfast','lunch','dinner','snack'] },
  date:     { type: Date, required: true, index: true },
}, { timestamps: true });

foodLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('FoodLog', foodLogSchema);
