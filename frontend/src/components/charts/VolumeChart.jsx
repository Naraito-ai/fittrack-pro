import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const VolumeChart = ({ data = [], days = 30 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');

    // Map data to date keyed object
    const dateMap = {};
    data.forEach(d => { dateMap[d._id] = d.totalVolume || 0; });

    const labels = [];
    const values = [];
    const colors = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      const val = dateMap[key] || 0;

      labels.push(i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }));
      values.push(Math.round(val));
      colors.push(
        i === 0 ? 'rgba(163,230,53,0.75)' :
        val > 0 ? 'rgba(163,230,53,0.3)'  :
                  'rgba(50,58,78,0.4)'
      );
    }

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Volume (kg)',
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.75', '1').replace('0.3', '0.6')),
          borderWidth: 1.5,
          borderRadius: 5,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#181c26',
            borderColor: '#323a4e',
            borderWidth: 1,
            titleColor: '#94a3b8',
            bodyColor: '#a3e635',
            titleFont: { family: '"DM Mono", monospace', size: 11 },
            bodyFont: { family: '"DM Mono", monospace', size: 13, weight: '500' },
            padding: 10,
            callbacks: {
              label: (ctx) => ctx.parsed.y > 0 ? ` ${ctx.parsed.y.toLocaleString()} kg volume` : ' Rest day',
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#6b7a99',
              font: { family: '"DM Mono", monospace', size: 10 },
              maxTicksLimit: days <= 7 ? 7 : 10,
              maxRotation: 0,
            },
          },
          y: {
            grid: { color: 'rgba(50,58,78,0.4)', drawBorder: false },
            border: { display: false },
            ticks: {
              color: '#6b7a99',
              font: { family: '"DM Mono", monospace', size: 10 },
              maxTicksLimit: 5,
              callback: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v,
            },
            min: 0,
          },
        },
        animation: { duration: 500, easing: 'easeOutQuart' },
      },
    });

    return () => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, [data, days]);

  return (
    <div style={{ height: '160px', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default VolumeChart;
