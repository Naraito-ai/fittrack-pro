import { useState } from 'react';

const MUSCLE_COLORS = {
  chest:     'text-rose-400 bg-rose-500/10 border-rose-500/20',
  back:      'text-azure-400 bg-azure-500/10 border-azure-500/20',
  shoulders: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  biceps:    'text-lime-400 bg-lime-500/10 border-lime-500/20',
  triceps:   'text-teal-400 bg-teal-500/10 border-teal-500/20',
  legs:      'text-amber-400 bg-amber-500/10 border-amber-500/20',
  glutes:    'text-pink-400 bg-pink-500/10 border-pink-500/20',
  core:      'text-orange-400 bg-orange-500/10 border-orange-500/20',
  cardio:    'text-red-400 bg-red-500/10 border-red-500/20',
  full_body: 'text-white bg-white/5 border-white/10',
  other:     'text-forge-400 bg-forge-700 border-forge-600',
};

// A "card" represents one exercise (may have multiple set entries)
const WorkoutCard = ({ exerciseName, sets, muscleGroup, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const totalVolume = sets.reduce((s, l) => s + (l.volume || 0), 0);
  const totalSets = sets.length;
  const maxWeight = Math.max(...sets.map(l => l.weightKg));
  const muscleColor = MUSCLE_COLORS[muscleGroup] || MUSCLE_COLORS.other;

  const handleDelete = async (id) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    try {
      await onDelete(id);
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="card overflow-hidden animate-slide-up">
      {/* Exercise header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-forge-750/40 transition-colors"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="w-6 h-6 flex items-center justify-center text-forge-500 flex-shrink-0 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="min-w-0">
            <p className="font-display font-700 text-white text-sm tracking-wide truncate">{exerciseName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`badge border text-[10px] ${muscleColor}`}>
                {muscleGroup?.replace('_', ' ')}
              </span>
              <span className="font-mono text-xs text-forge-500">{totalSets} set{totalSets !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-4 flex-shrink-0 ml-2">
          <div className="text-right hidden sm:block">
            <p className="font-mono font-500 text-xs text-forge-400">Max</p>
            <p className="font-mono font-500 text-white text-sm tabular-nums">{maxWeight}<span className="text-forge-500 text-xs">kg</span></p>
          </div>
          <div className="text-right">
            <p className="font-mono font-500 text-xs text-forge-400">Vol</p>
            <p className="font-mono font-500 text-amber-400 text-sm tabular-nums">
              {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}
              <span className="text-forge-500 text-xs">kg</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sets table */}
      {expanded && (
        <div className="border-t border-forge-700">
          {/* Column headers */}
          <div className="grid grid-cols-[2rem_1fr_1fr_1fr_auto] gap-2 px-4 py-2 bg-forge-800/50">
            <span className="font-mono text-[10px] text-forge-500 uppercase tracking-wider text-center">#</span>
            <span className="font-mono text-[10px] text-forge-500 uppercase tracking-wider text-center">Weight</span>
            <span className="font-mono text-[10px] text-forge-500 uppercase tracking-wider text-center">Reps</span>
            <span className="font-mono text-[10px] text-forge-500 uppercase tracking-wider text-center">Volume</span>
            <span className="font-mono text-[10px] text-forge-500 uppercase tracking-wider text-center w-14"></span>
          </div>

          {/* Set rows */}
          <div className="divide-y divide-forge-750/60">
            {sets.map((set, i) => (
              <div
                key={set._id}
                className="grid grid-cols-[2rem_1fr_1fr_1fr_auto] gap-2 items-center px-4 py-2.5 hover:bg-forge-750/30 transition-colors group"
              >
                <span className="font-mono text-xs text-forge-500 text-center tabular-nums">{i + 1}</span>
                <span className="font-mono font-500 text-white text-sm text-center tabular-nums">
                  {set.weightKg}<span className="text-forge-500 text-xs">kg</span>
                </span>
                <span className="font-mono font-500 text-white text-sm text-center tabular-nums">
                  {set.reps}<span className="text-forge-500 text-xs">×</span>
                </span>
                <span className="font-mono font-500 text-amber-400 text-sm text-center tabular-nums">
                  {set.volume?.toLocaleString() || 0}<span className="text-forge-500 text-xs">kg</span>
                </span>

                {/* Row actions */}
                <div className="flex items-center gap-1 justify-end w-14 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(set); }}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-forge-500 hover:text-forge-300 hover:bg-forge-700 transition-all"
                    title="Edit set"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(set._id); }}
                    className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${
                      confirmDelete === set._id
                        ? 'text-crimson-400 bg-crimson-500/20'
                        : 'text-forge-500 hover:text-crimson-400 hover:bg-crimson-500/10'
                    }`}
                    title={confirmDelete === set._id ? 'Tap again to confirm' : 'Delete set'}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add another set button */}
          <div className="px-4 py-2.5 bg-forge-800/30">
            <button
              onClick={() => onEdit({ exerciseName, muscleGroup, weightKg: sets[sets.length - 1]?.weightKg || 0, reps: sets[sets.length - 1]?.reps || 0, sets: 1, _isNewSet: true })}
              className="text-xs font-display font-600 tracking-wide text-forge-500 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
              </svg>
              ADD SET
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCard;
