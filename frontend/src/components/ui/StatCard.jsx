const StatCard = ({ label, value, unit, sub, color = 'amber', icon, trend }) => {
  const colorMap = {
    amber:     { accent: 'text-amber-400',     border: 'border-amber-500/20',    bg: 'bg-amber-500/5' },
    blue:      { accent: 'text-azure-400',     border: 'border-azure-500/20',    bg: 'bg-azure-500/5' },
    orange:    { accent: 'text-tangerine-400', border: 'border-tangerine-500/20',bg: 'bg-tangerine-500/5' },
    teal:      { accent: 'text-teal-400',      border: 'border-teal-500/20',     bg: 'bg-teal-500/5' },
    green:     { accent: 'text-lime-400',      border: 'border-lime-500/20',     bg: 'bg-lime-500/5' },
    red:       { accent: 'text-crimson-400',   border: 'border-crimson-500/20',  bg: 'bg-crimson-500/5' },
    default:   { accent: 'text-forge-300',     border: 'border-forge-700',       bg: 'bg-forge-800' },
  };

  const c = colorMap[color] || colorMap.default;

  return (
    <div className={`card p-4 border ${c.border} ${c.bg} animate-slide-up`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="section-title mb-2">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className={`font-display font-800 text-2xl leading-none tabular-nums ${c.accent}`}>
              {value ?? '—'}
            </span>
            {unit && (
              <span className="font-mono text-xs text-forge-500">{unit}</span>
            )}
          </div>
          {sub && (
            <p className="font-mono text-xs text-forge-500 mt-1.5 truncate">{sub}</p>
          )}
        </div>
        {icon && (
          <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center ${c.accent}`}>
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-mono ${trend >= 0 ? 'text-lime-400' : 'text-crimson-400'}`}>
          <span>{trend >= 0 ? '▲' : '▼'}</span>
          <span>{Math.abs(trend)} vs last week</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
