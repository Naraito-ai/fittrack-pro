import { useState, useEffect, useRef } from 'react';

const MUSCLE_GROUPS = [
  { value: 'chest',     label: '💪 Chest' },
  { value: 'back',      label: '🔙 Back' },
  { value: 'shoulders', label: '🏋️ Shoulders' },
  { value: 'biceps',    label: '💪 Biceps' },
  { value: 'triceps',   label: '🦾 Triceps' },
  { value: 'legs',      label: '🦵 Legs' },
  { value: 'glutes',    label: '🍑 Glutes' },
  { value: 'core',      label: '🎯 Core' },
  { value: 'cardio',    label: '🏃 Cardio' },
  { value: 'full_body', label: '⚡ Full Body' },
  { value: 'other',     label: '🔧 Other' },
];

// Common exercise suggestions per muscle group
const EXERCISE_SUGGESTIONS = {
  chest:     ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Fly', 'Push Up', 'Cable Fly', 'Chest Dip'],
  back:      ['Deadlift', 'Pull Up', 'Bent-Over Row', 'Lat Pulldown', 'Seated Cable Row', 'T-Bar Row', 'Face Pull'],
  shoulders: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Arnold Press', 'Rear Delt Fly', 'Upright Row'],
  biceps:    ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Concentration Curl', 'Cable Curl'],
  triceps:   ['Tricep Pushdown', 'Skull Crusher', 'Close-Grip Bench', 'Overhead Tricep Extension', 'Dips', 'Kickback'],
  legs:      ['Squat', 'Leg Press', 'Romanian Deadlift', 'Lunges', 'Leg Curl', 'Leg Extension', 'Calf Raise'],
  glutes:    ['Hip Thrust', 'Glute Bridge', 'Bulgarian Split Squat', 'Cable Kickback', 'Sumo Deadlift'],
  core:      ['Plank', 'Crunches', 'Russian Twist', 'Hanging Leg Raise', 'Ab Wheel', 'Cable Crunch'],
  cardio:    ['Running', 'Cycling', 'Jump Rope', 'Rowing', 'Elliptical', 'Stair Climber'],
  full_body: ['Burpees', 'Clean and Press', 'Thruster', 'Kettlebell Swing', 'Turkish Get-Up'],
  other:     [],
};

const EMPTY_FORM = {
  exerciseName: '',
  weightKg: '',
  reps: '',
  sets: '',
  muscleGroup: 'other',
  notes: '',
};

const WorkoutForm = ({ onSubmit, onClose, initialData = null, existingExercises = [], date }) => {
  const [form, setForm] = useState(initialData ? {
    exerciseName: initialData.exerciseName,
    weightKg: initialData.weightKg,
    reps: initialData.reps,
    sets: initialData.sets,
    muscleGroup: initialData.muscleGroup || 'other',
    notes: initialData.notes || '',
  } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const isEditing = !!initialData;

  const volume = Math.round((Number(form.weightKg) || 0) * (Number(form.reps) || 0) * (Number(form.sets) || 0));

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(p => ({ ...p, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }));
  };

  const handleExerciseInput = (e) => {
    const val = e.target.value;
    setForm(p => ({ ...p, exerciseName: val }));

    // Build suggestions: existing exercises + muscle group presets, filtered by input
    const term = val.toLowerCase();
    const musclePresets = EXERCISE_SUGGESTIONS[form.muscleGroup] || [];
    const all = [...new Set([...existingExercises, ...musclePresets])];
    const filtered = term.length > 0
      ? all.filter(e => e.toLowerCase().includes(term)).slice(0, 6)
      : musclePresets.slice(0, 6);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const applySuggestion = (name) => {
    setForm(p => ({ ...p, exerciseName: name }));
    setShowSuggestions(false);
    // Auto-detect muscle group from presets
    for (const [group, exercises] of Object.entries(EXERCISE_SUGGESTIONS)) {
      if (exercises.includes(name)) {
        setForm(p => ({ ...p, exerciseName: name, muscleGroup: group }));
        break;
      }
    }
  };

  const handleMuscleGroupChange = (group) => {
    setForm(p => ({ ...p, muscleGroup: group }));
    const presets = EXERCISE_SUGGESTIONS[group] || [];
    if (!form.exerciseName) {
      setSuggestions(presets.slice(0, 6));
      setShowSuggestions(presets.length > 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.exerciseName.trim() || !form.reps || !form.sets) return;
    setLoading(true);
    try {
      await onSubmit({
        exerciseName: form.exerciseName.trim(),
        weightKg: Number(form.weightKg) || 0,
        reps: Number(form.reps),
        sets: Number(form.sets),
        muscleGroup: form.muscleGroup,
        notes: form.notes,
        date,
      });
      onClose();
    } catch (err) {
      console.error('WorkoutForm submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Muscle Group selector */}
      <div className="form-group">
        <label className="input-label">Muscle Group</label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {MUSCLE_GROUPS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleMuscleGroupChange(value)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-display font-600 tracking-wide transition-all ${
                form.muscleGroup === value
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                  : 'border-forge-600 text-forge-400 hover:border-forge-500 hover:text-forge-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Name with autocomplete */}
      <div className="form-group relative">
        <label className="input-label">Exercise Name *</label>
        <input
          ref={inputRef}
          name="exerciseName"
          value={form.exerciseName}
          onChange={handleExerciseInput}
          onFocus={() => {
            if (!form.exerciseName) {
              const presets = EXERCISE_SUGGESTIONS[form.muscleGroup] || [];
              setSuggestions(presets.slice(0, 6));
              setShowSuggestions(presets.length > 0);
            }
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="input"
          placeholder="e.g. Bench Press"
          required
          autoComplete="off"
        />
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-forge-800 border border-forge-600 rounded-xl shadow-forge-lg overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => applySuggestion(s)}
                className="w-full text-left px-3 py-2.5 text-sm font-display font-600 text-forge-300 hover:bg-forge-700 hover:text-white transition-colors flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-forge-500 flex-shrink-0">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
                </svg>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Weight / Reps / Sets */}
      <div className="grid grid-cols-3 gap-2">
        <div className="form-group">
          <label className="input-label">Weight (kg)</label>
          <input
            type="number" name="weightKg" value={form.weightKg}
            onChange={handleChange} min="0" step="0.5"
            className="input text-center"
            placeholder="0"
          />
        </div>
        <div className="form-group">
          <label className="input-label">Reps *</label>
          <input
            type="number" name="reps" value={form.reps}
            onChange={handleChange} min="1" step="1"
            className="input text-center"
            placeholder="8"
            required
          />
        </div>
        <div className="form-group">
          <label className="input-label">Sets *</label>
          <input
            type="number" name="sets" value={form.sets}
            onChange={handleChange} min="1" step="1"
            className="input text-center"
            placeholder="3"
            required
          />
        </div>
      </div>

      {/* Volume preview */}
      {volume > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-forge-750 border border-forge-600 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-display font-600 text-forge-400 text-xs tracking-wide uppercase">Volume</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono font-500 text-amber-400 text-lg tabular-nums">{volume.toLocaleString()}</span>
            <span className="font-mono text-xs text-forge-500">kg</span>
          </div>
          <div className="font-mono text-xs text-forge-500">
            {form.weightKg}kg × {form.reps} × {form.sets}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="form-group">
        <label className="input-label">Notes <span className="text-forge-600 normal-case font-body">(optional)</span></label>
        <input
          name="notes" value={form.notes}
          onChange={handleChange}
          className="input"
          placeholder="e.g. Paused reps, felt strong today..."
          maxLength={300}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button
          type="submit"
          disabled={loading || !form.exerciseName || !form.reps || !form.sets}
          className="btn-primary flex-1"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Set' : 'Log Set'}
        </button>
      </div>
    </form>
  );
};

export default WorkoutForm;
