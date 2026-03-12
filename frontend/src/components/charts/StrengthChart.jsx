import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const StrengthChart = ({ data = [], exerciseName = '', height = 200 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');

    const labels     = data.map(d => {
      const date = new Date(d._id);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const maxWeights = data.map(d => d.maxWeight);
    const volumes    = data.map(d => Math.round(d.totalVolume / 1000 * 10) / 10); // in tonnes

    // Gradient for weight line
    const weightGradient = ctx.createLinearGradient(0, 0, 0, height);
    weightGradient.addColorStop(0, 'rgba(245,158,11,0.2)');
    weightGradient.addColorStop(1, 'rgba(245,158,11,0.0)');

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Max Weight (kg)',
            data: maxWeights,
            borderColor: '#f59e0b',
            backgroundColor: weightGradient,
            borderWidth: 2.5,
            pointRadius: data.length > 20 ? 3 : 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#0f1117',
            pointBorderWidth: 2,
            fill: true,
            tension: 0.3,
            yAxisID: 'y',
          },
          {
            label: 'Volume (t)',
            data: volumes,
            borderColor: 'rgba(163,230,53,0.7)',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [4, 3],
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: false,
            tension: 0.3,
            yAxisID: 'y2',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color: '#6b7a99',
              font: { family: '"DM Mono", monospace', size: 11 },
              boxWidth: 12,
              boxHeight: 2,
              padding: 12,
              usePointStyle: true,
              pointStyle: 'line',
            },
          },
          tooltip: {
            backgroundColor: '#181c26',
            borderColor: '#323a4e',
            borderWidth: 1,
            titleColor: '#94a3b8',
            titleFont: { family: '"DM Mono", monospace', size: 11 },
            bodyFont: { family: '"DM Mono", monospace', size: 12 },
            padding: 12,
            callbacks: {
              label: (ctx) => {
                if (ctx.datasetIndex === 0) return ` Max: ${ctx.parsed.y} kg`;
                return ` Vol: ${ctx.parsed.y}t`;
              },
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
              maxTicksLimit: 8,
              maxRotation: 0,
            },
          },
          y: {
            position: 'left',
            grid: { color: 'rgba(50,58,78,0.5)', drawBorder: false },
            border: { display: false },
            ticks: {
              color: '#f59e0b',
              font: { family: '"DM Mono", monospace', size: 10 },
              maxTicksLimit: 5,
              callback: (v) => `${v}kg`,
            },
          },
          y2: {
            position: 'right',
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: 'rgba(163,230,53,0.6)',
              font: { family: '"DM Mono", monospace', size: 10 },
              maxTicksLimit: 5,
              callback: (v) => `${v}t`,
            },
          },
        },
        animation: { duration: 600, easing: 'easeOutQuart' },
      },
    });

    return () => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, [data, exerciseName, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-forge-500 font-mono text-xs" style={{ height }}>
        No data for this exercise yet
      </div>
    );
  }

  return (
    <div style={{ height, position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default StrengthChart;
