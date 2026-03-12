const MACRO_STYLES = {
  calories: { bar: 'bg-amber-500', text: 'text-amber-400', track: 'bg-amber-500/15' },
  protein:  { bar: 'bg-azure-500', text: 'text-azure-400', track: 'bg-azure-500/15' },
  fats:     { bar: 'bg-tangerine-500', text: 'text-tangerine-400', track: 'bg-tangerine-500/15' },
  carbs:    { bar: 'bg-teal-500', text: 'text-teal-400', track: 'bg-teal-500/15' },
};

const MacroBar = ({ label, current, target, unit = 'g', type = 'calories', compact = false }) => {
  const styles = MACRO_STYLES[type] || MACRO_STYLES.calories;
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const over = target > 0 && current > target;

  return (
    <div className={`${compact ? 'gap-1.5' : 'gap-2'} flex flex-col`}>
      <div className="flex items-center justify-between">
        <span className={`font-display font-600 tracking-wider uppercase text-xs ${styles.text}`}>
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className={`font-mono font-500 text-sm text-white tabular-nums`}>
            {Math.round(current)}
          </span>
          <span className="font-mono text-xs text-forge-500">
            / {target}{unit}
          </span>
          {over && (
            <span className="text-crimson-400 font-mono text-xs">↑</span>
          )}
        </div>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${styles.track}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${over ? 'bg-crimson-500' : styles.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!compact && (
        <div className="flex justify-end">
          <span className={`font-mono text-xs ${over ? 'text-crimson-400' : 'text-forge-500'}`}>
            {over ? `+${Math.round(current - target)}${unit} over` : `${Math.round(target - current)}${unit} left`}
          </span>
        </div>
      )}
    </div>
  );
};

export default MacroBar;
