// Circular macro breakdown ring (pure SVG, no chart lib needed)
const MacroRing = ({ protein = 0, fats = 0, carbs = 0, calories = 0, targetCalories = 2000, size = 120 }) => {
  const totalMacroKcal = protein * 4 + fats * 9 + carbs * 4;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) - 10;
  const circumference = 2 * Math.PI * r;

  // Proportions from macros
  const proteinPct = totalMacroKcal > 0 ? (protein * 4) / totalMacroKcal : 0;
  const fatsPct    = totalMacroKcal > 0 ? (fats * 9)   / totalMacroKcal : 0;
  const carbsPct   = totalMacroKcal > 0 ? (carbs * 4)  / totalMacroKcal : 0;

  // Overall fill vs target
  const overallPct = Math.min(calories / targetCalories, 1);

  const segments = [
    { pct: proteinPct, color: '#60a5fa', label: 'P' }, // azure
    { pct: fatsPct,    color: '#fb923c', label: 'F' }, // tangerine
    { pct: carbsPct,   color: '#2dd4bf', label: 'C' }, // teal
  ];

  let offset = 0;
  const gap = 2; // gap in px between segments

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#252b38" strokeWidth="8" />

          {totalMacroKcal > 0 ? (
            segments.map((seg, i) => {
              const segLen = seg.pct * circumference * overallPct - gap;
              if (segLen <= 0) return null;
              const dash = `${segLen} ${circumference - segLen}`;
              const dashOffset = -(offset * circumference * overallPct);
              offset += seg.pct;

              return (
                <circle
                  key={i}
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="8"
                  strokeDasharray={dash}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }}
                />
              );
            })
          ) : (
            // Empty state arc
            <circle
              cx={cx} cy={cy} r={r}
              fill="none" stroke="#323a4e" strokeWidth="8"
              strokeDasharray={`${circumference * 0.95} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-500 text-white tabular-nums" style={{ fontSize: size > 100 ? '1.125rem' : '0.875rem' }}>
            {Math.round(calories)}
          </span>
          <span className="font-mono text-forge-500" style={{ fontSize: '0.625rem' }}>kcal</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3">
        {[
          { label: 'P', val: Math.round(protein), color: 'bg-azure-400', textColor: 'text-azure-400' },
          { label: 'F', val: Math.round(fats), color: 'bg-tangerine-400', textColor: 'text-tangerine-400' },
          { label: 'C', val: Math.round(carbs), color: 'bg-teal-400', textColor: 'text-teal-400' },
        ].map(({ label, val, color, textColor }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
            <span className={`font-mono text-xs ${textColor}`}>{val}g</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MacroRing;
