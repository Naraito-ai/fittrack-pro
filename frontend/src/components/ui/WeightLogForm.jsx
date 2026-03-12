import { useState } from 'react';
import { todayStr } from '../../utils/dateHelpers';

const WeightLogForm = ({ onSubmit, onClose, lastWeight = null }) => {
  const [form, setForm] = useState({
    bodyWeight: lastWeight || '',
    date: todayStr(),
    note: '',
    bodyFatPercentage: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(p => ({ ...p, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bodyWeight) return;
    setLoading(true);
    try {
      await onSubmit({
        bodyWeight: Number(form.bodyWeight),
        date: form.date,
        note: form.note || undefined,
        bodyFatPercentage: form.bodyFatPercentage ? Number(form.bodyFatPercentage) : undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // BMI preview (if user has height in profile)
  const bmiNote = null; // would need height from user context

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="input-label">Body Weight (kg) *</label>
          <input
            type="number" name="bodyWeight" value={form.bodyWeight}
            onChange={handleChange} min="20" max="500" step="0.1"
            className="input text-center font-mono text-lg"
            placeholder="75.0"
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="input-label">Date</label>
          <input
            type="date" name="date" value={form.date}
            onChange={handleChange}
            max={todayStr()}
            className="input"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="input-label">
          Body Fat % <span className="text-forge-600 normal-case font-body">(optional)</span>
        </label>
        <input
          type="number" name="bodyFatPercentage" value={form.bodyFatPercentage}
          onChange={handleChange} min="1" max="70" step="0.1"
          className="input"
          placeholder="e.g. 15.5"
        />
      </div>

      <div className="form-group">
        <label className="input-label">Note <span className="text-forge-600 normal-case font-body">(optional)</span></label>
        <input
          name="note" value={form.note}
          onChange={handleChange}
          className="input"
          placeholder="e.g. Morning, post-workout, feeling lean..."
          maxLength={200}
        />
      </div>

      {/* Weight diff preview */}
      {lastWeight && form.bodyWeight && (
        <div className="flex items-center justify-between px-4 py-3 bg-forge-750 border border-forge-600 rounded-xl">
          <span className="font-mono text-xs text-forge-500">Change from last entry</span>
          <span className={`font-mono font-500 text-sm ${
            Number(form.bodyWeight) > lastWeight ? 'text-tangerine-400' :
            Number(form.bodyWeight) < lastWeight ? 'text-lime-400' :
            'text-forge-400'
          }`}>
            {Number(form.bodyWeight) > lastWeight ? '+' : ''}
            {(Number(form.bodyWeight) - lastWeight).toFixed(1)} kg
          </span>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={loading || !form.bodyWeight} className="btn-primary flex-1">
          {loading ? 'Saving...' : 'Log Weight'}
        </button>
      </div>
    </form>
  );
};

export default WeightLogForm;
