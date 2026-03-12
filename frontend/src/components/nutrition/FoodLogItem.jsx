import { useState } from 'react';

const MEAL_COLORS = {
  breakfast: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  lunch:     'text-lime-400 bg-lime-500/10 border-lime-500/20',
  dinner:    'text-azure-400 bg-azure-500/10 border-azure-500/20',
  snack:     'text-teal-400 bg-teal-500/10 border-teal-500/20',
};

const FoodLogItem = ({ log, onEdit, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalCals = Math.round(log.calories * log.quantity);
  const totalProtein = Math.round(log.protein * log.quantity * 10) / 10;
  const totalFats = Math.round(log.fats * log.quantity * 10) / 10;
  const totalCarbs = Math.round(log.carbs * log.quantity * 10) / 10;

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await onDelete(log._id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="group flex items-start gap-3 px-4 py-3 hover:bg-forge-750/50 transition-colors rounded-lg -mx-1">
      {/* Left: name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-display font-600 text-white text-sm leading-tight truncate">
            {log.foodName}
          </p>
          <span className={`badge border text-[10px] ${MEAL_COLORS[log.mealType] || MEAL_COLORS.snack}`}>
            {log.mealType}
          </span>
        </div>
        <p className="font-mono text-xs text-forge-500 mt-0.5">
          {log.quantity} {log.unit}
          {' · '}
          <span className="text-azure-400">{totalProtein}g P</span>
          {' · '}
          <span className="text-tangerine-400">{totalFats}g F</span>
          {' · '}
          <span className="text-teal-400">{totalCarbs}g C</span>
        </p>
      </div>

      {/* Right: calories + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-mono font-500 text-amber-400 text-sm tabular-nums">
          {totalCals} <span className="text-forge-500 text-xs">kcal</span>
        </span>

        {/* Action buttons - visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(log)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-forge-500 hover:text-forge-300 hover:bg-forge-700 transition-all"
            title="Edit"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${
              confirmDelete
                ? 'text-crimson-400 bg-crimson-500/20 hover:bg-crimson-500/30'
                : 'text-forge-500 hover:text-crimson-400 hover:bg-crimson-500/10'
            }`}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round"/>
              <path d="M10 11v6M14 11v6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodLogItem;
