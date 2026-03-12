import { useMemo } from 'react';

// Generates the last N weeks of calendar grid
const buildCalendarGrid = (activityMap, weeks = 13) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the Sunday that starts our grid
  const gridEnd = new Date(today);
  const dayOfWeek = gridEnd.getDay(); // 0=Sun
  // Pad to end of week (Saturday)
  const daysToSaturday = 6 - dayOfWeek;
  gridEnd.setDate(gridEnd.getDate() + daysToSaturday);

  const totalDays = weeks * 7;
  const gridStart = new Date(gridEnd);
  gridStart.setDate(gridEnd.getDate() - totalDays + 1);

  const grid = []; // array of weeks, each week is array of 7 days
  let current = new Date(gridStart);

  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split('T')[0];
      const isFuture = current > today;
      week.push({
        date: dateStr,
        volume: isFuture ? null : (activityMap[dateStr] || 0),
        isToday: dateStr === today.toISOString().split('T')[0],
        isFuture,
        dayLabel: current.toLocaleDateString('en-US', { weekday: 'short' }),
        monthLabel: d === 0 ? current.toLocaleDateString('en-US', { month: 'short' }) : '',
      });
      current.setDate(current.getDate() + 1);
    }
    grid.push(week);
  }

  return grid;
};

const getIntensityClass = (volume, maxVolume) => {
  if (volume === null) return 'bg-forge-950 opacity-30'; // future
  if (volume === 0) return 'bg-forge-800 border border-forge-700/50';
  const pct = maxVolume > 0 ? volume / maxVolume : 0;
  if (pct < 0.25) return 'bg-lime-500/25 border border-lime-500/20';
  if (pct < 0.5)  return 'bg-lime-500/45 border border-lime-500/30';
  if (pct < 0.75) return 'bg-lime-500/65 border border-lime-500/40';
  return 'bg-lime-500 border border-lime-400/50 shadow-sm';
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const FrequencyHeatmap = ({ data = [], weeks = 13 }) => {
  const activityMap = useMemo(() => {
    const map = {};
    data.forEach(d => { map[d._id] = d.totalVolume || 0; });
    return map;
  }, [data]);

  const maxVolume = useMemo(() => {
    const volumes = Object.values(activityMap).filter(v => v > 0);
    return volumes.length > 0 ? Math.max(...volumes) : 0;
  }, [activityMap]);

  const grid = useMemo(() => buildCalendarGrid(activityMap, weeks), [activityMap, weeks]);

  const totalWorkoutDays = Object.values(activityMap).filter(v => v > 0).length;
  const currentStreak = useMemo(() => {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (activityMap[key] > 0) streak++;
      else if (i > 0) break;
    }
    return streak;
  }, [activityMap]);

  // Get month labels from first row of each week
  const monthLabels = grid.map(week => week[0].monthLabel);

  return (
    <div className="space-y-3">
      {/* Stats strip */}
      <div className="flex items-center gap-4">
        <div>
          <p className="font-mono text-xs text-forge-500">Sessions</p>
          <p className="font-display font-800 text-xl text-lime-400 tabular-nums">{totalWorkoutDays}</p>
        </div>
        <div className="w-px h-8 bg-forge-700" />
        <div>
          <p className="font-mono text-xs text-forge-500">Streak</p>
          <p className="font-display font-800 text-xl text-amber-400 tabular-nums">
            {currentStreak}<span className="text-sm text-forge-500 ml-1">days</span>
          </p>
        </div>
        <div className="w-px h-8 bg-forge-700" />
        <div>
          <p className="font-mono text-xs text-forge-500">Period</p>
          <p className="font-display font-800 text-xl text-forge-300 tabular-nums">
            {weeks}w
          </p>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          {/* Month labels row */}
          <div className="flex mb-1 ml-6">
            {monthLabels.map((label, i) => (
              <div key={i} className="font-mono text-[10px] text-forge-500 flex-shrink-0" style={{ width: 18, marginRight: 2 }}>
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-0.5 mr-1.5">
              {DAYS.map((d, i) => (
                <div key={i} className="font-mono text-[10px] text-forge-600 flex items-center justify-center" style={{ width: 16, height: 16 }}>
                  {i % 2 === 1 ? d : ''}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`rounded-sm cursor-default transition-all ${getIntensityClass(day.volume, maxVolume)} ${day.isToday ? 'ring-1 ring-amber-500/60 ring-offset-1 ring-offset-forge-900' : ''}`}
                    style={{ width: 16, height: 16, flexShrink: 0 }}
                    title={
                      day.isFuture
                        ? day.date
                        : day.volume === 0
                        ? `${day.date}: Rest day`
                        : `${day.date}: ${Math.round(day.volume).toLocaleString()} kg volume`
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5">
        <span className="font-mono text-[10px] text-forge-500">Less</span>
        {['bg-forge-800', 'bg-lime-500/25', 'bg-lime-500/45', 'bg-lime-500/65', 'bg-lime-500'].map((cls, i) => (
          <div key={i} className={`w-3.5 h-3.5 rounded-sm ${cls}`} />
        ))}
        <span className="font-mono text-[10px] text-forge-500">More</span>
      </div>
    </div>
  );
};

export default FrequencyHeatmap;
