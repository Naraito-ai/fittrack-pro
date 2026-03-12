import { useState, useEffect } from 'react';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const UNITS = ['serving', 'g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece'];

const EMPTY_FORM = {
  foodName: '',
  calories: '',
  protein: '',
  fats: '',
  carbs: '',
  quantity: 1,
  unit: 'serving',
  mealType: 'snack',
};

// Quick-fill presets for common foods
const PRESETS = [
  { foodName: 'Chicken Breast (100g)', calories: 165, protein: 31, fats: 3.6, carbs: 0, unit: 'g', quantity: 100 },
  { foodName: 'White Rice (cooked)', calories: 206, protein: 4.3, fats: 0.4, carbs: 44.5, unit: 'cup', quantity: 1 },
  { foodName: 'Whole Egg', calories: 78, protein: 6, fats: 5, carbs: 0.6, unit: 'piece', quantity: 1 },
  { foodName: 'Whey Protein Shake', calories: 120, protein: 25, fats: 1.5, carbs: 3, unit: 'serving', quantity: 1 },
  { foodName: 'Banana', calories: 105, protein: 1.3, fats: 0.4, carbs: 27, unit: 'piece', quantity: 1 },
  { foodName: 'Oats (dry)', calories: 150, protein: 5, fats: 2.5, carbs: 27, unit: 'g', quantity: 40 },
];

const FoodLogForm = ({ onSubmit, onClose, initialData = null, date }) => {
  const [form, setForm] = useState(initialData ? {
    foodName: initialData.foodName,
    calories: initialData.calories,
    protein: initialData.protein,
    fats: initialData.fats,
    carbs: initialData.carbs,
    quantity: initialData.quantity,
    unit: initialData.unit,
    mealType: initialData.mealType,
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const isEditing = !!initialData;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(p => ({ ...p, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
  };

  const applyPreset = (preset) => {
    setForm(p => ({ ...p, ...preset }));
    setShowPresets(false);
  };

  // Estimated calories from macros
  const estimatedCals = Math.round(
    (Number(form.protein) || 0) * 4 +
    (Number(form.carbs) || 0) * 4 +
    (Number(form.fats) || 0) * 9
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.foodName.trim()) return;
    if (form.calories === '' || form.calories < 0) return;

    setLoading(true);
    try {
      await onSubmit({
        ...form,
        calories: Number(form.calories),
        protein: Number(form.protein) || 0,
        fats: Number(form.fats) || 0,
        carbs: Number(form.carbs) || 0,
        quantity: Number(form.quantity) || 1,
        date,
      });
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Presets toggle */}
      {!isEditing && (
        <div>
          <button
            type="button"
            onClick={() => setShowPresets(p => !p)}
            className="text-xs font-display font-600 tracking-wide text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {showPresets ? 'HIDE' : 'QUICK FILL'} PRESETS
          </button>

          {showPresets && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.foodName}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="text-left px-2.5 py-2 rounded-lg bg-forge-750 border border-forge-600 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
                >
                  <p className="text-white text-xs font-display font-600 leading-tight truncate">{p.foodName}</p>
                  <p className="text-forge-500 text-xs font-mono mt-0.5">{p.calories} kcal</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Food Name */}
      <div className="form-group">
        <label className="input-label">Food Name *</label>
        <input
          name="foodName"
          value={form.foodName}
          onChange={handleChange}
          className="input"
          placeholder="e.g. Grilled Chicken Breast"
          required
          autoFocus={!isEditing}
        />
      </div>

      {/* Quantity + Unit + Meal */}
      <div className="grid grid-cols-3 gap-2">
        <div className="form-group">
          <label className="input-label">Qty</label>
          <input
            type="number" name="quantity" value={form.quantity}
            onChange={handleChange} min="0.1" step="0.1"
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="input-label">Unit</label>
          <select name="unit" value={form.unit} onChange={handleChange} className="input">
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="input-label">Meal</label>
          <select name="mealType" value={form.mealType} onChange={handleChange} className="input capitalize">
            {MEAL_TYPES.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
          </select>
        </div>
      </div>

      {/* Macros */}
      <div className="bg-forge-750 border border-forge-600 rounded-xl p-4 space-y-3">
        <p className="section-title">Macros per {form.unit}</p>

        <div className="form-group">
          <div className="flex items-center justify-between">
            <label className="input-label macro-calories">Calories *</label>
            {estimatedCals > 0 && Math.abs(estimatedCals - Number(form.calories)) > 5 && (
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, calories: estimatedCals }))}
                className="text-xs font-mono text-forge-500 hover:text-amber-400 transition-colors"
              >
                ≈{estimatedCals} from macros
              </button>
            )}
          </div>
          <input
            type="number" name="calories" value={form.calories}
            onChange={handleChange} min="0" step="1"
            className="input"
            placeholder="0"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="form-group">
            <label className="input-label macro-protein">Protein (g)</label>
            <input type="number" name="protein" value={form.protein}
              onChange={handleChange} min="0" step="0.1" className="input" placeholder="0" />
          </div>
          <div className="form-group">
            <label className="input-label macro-fat">Fat (g)</label>
            <input type="number" name="fats" value={form.fats}
              onChange={handleChange} min="0" step="0.1" className="input" placeholder="0" />
          </div>
          <div className="form-group">
            <label className="input-label macro-carbs">Carbs (g)</label>
            <input type="number" name="carbs" value={form.carbs}
              onChange={handleChange} min="0" step="0.1" className="input" placeholder="0" />
          </div>
        </div>

        {/* Macro breakdown preview */}
        {(Number(form.protein) + Number(form.fats) + Number(form.carbs)) > 0 && (
          <div className="flex gap-2 pt-1">
            {[
              { label: 'P', val: form.protein, color: 'text-azure-400 bg-azure-500/10' },
              { label: 'F', val: form.fats, color: 'text-tangerine-400 bg-tangerine-500/10' },
              { label: 'C', val: form.carbs, color: 'text-teal-400 bg-teal-500/10' },
            ].map(({ label, val, color }) => (
              <div key={label} className={`flex items-center gap-1 px-2 py-1 rounded-md ${color}`}>
                <span className="font-display font-700 text-xs">{label}</span>
                <span className="font-mono text-xs">{Number(val) || 0}g</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={loading || !form.foodName || form.calories === ''} className="btn-primary flex-1">
          {loading ? 'Saving...' : isEditing ? 'Update' : 'Add Food'}
        </button>
      </div>
    </form>
  );
};

export default FoodLogForm;
