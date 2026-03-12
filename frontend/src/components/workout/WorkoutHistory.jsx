import { formatDate } from '../../utils/dateHelpers';

const WorkoutHistory = ({ history = [], onSelectDate }) => {
  if (history.length === 0) {
    return (
      <div className="empty-state py-10">
        <div className="w-12 h-12 rounded-xl bg-forge-800 border border-forge-700 flex items-center justify-center text-xl">🏋️</div>
        <p className="font-display font-600 text-white text-sm">No workout history yet</p>
        <p className="font-mono text-xs text-forge-500">Log your first workout to see history</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((session) => {
        const volumeK = session.totalVolume >= 1000
          ? `${(session.totalVolume / 1000).toFixed(1)}k`
          : Math.round(session.totalVolume).toLocaleString();

        return (
          <button
            key={session._id}
            onClick={() => onSelectDate(session._id)}
            className="w-full card-sm px-4 py-3 flex items-center justify-between hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group text-left"
          >
            {/* Left: date + exercises */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-display font-600 text-white text-sm group-hover:text-amber-400 transition-colors">
                  {formatDate(session._id + 'T12:00:00', 'EEE, MMM d')}
                </p>
                <span className="font-mono text-xs text-forge-600">
                  {session.logCount} set{session.logCount !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="font-mono text-xs text-forge-500 mt-0.5 truncate">
                {session.exercises?.slice(0, 3).join(' · ')}
                {session.exercises?.length > 3 ? ` +${session.exercises.length - 3} more` : ''}
              </p>
            </div>

            {/* Right: stats */}
            <div className="flex items-center gap-4 flex-shrink-0 ml-3">
              <div className="text-right hidden sm:block">
                <p className="font-mono text-xs text-forge-500">Sets</p>
                <p className="font-mono font-500 text-white text-sm tabular-nums">{session.totalSets}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-forge-500">Volume</p>
                <p className="font-mono font-500 text-amber-400 text-sm tabular-nums">
                  {volumeK}<span className="text-forge-500 text-xs">kg</span>
                </p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-forge-600 group-hover:text-amber-500 transition-colors flex-shrink-0">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default WorkoutHistory;
