import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const WeightChart = ({ data = [], height = 220 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');

    const labels    = data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const weights   = data.map(d => d.bodyWeight);
    const rollingAvg = data.map(d => d.rollingAvg);

    // Gradient fill under weight line
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(96,165,250,0.25)');
    gradient.addColorStop(1, 'rgba(96,165,250,0.0)');

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Body Weight',
            data: weights,
            borderColor: '#60a5fa',
            backgroundColor: gradient,
            borderWidth: 2,
            pointRadius: data.length > 30 ? 2 : 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#60a5fa',
            pointBorderColor: '#0f1117',
            pointBorderWidth: 2,
            fill: true,
            tension: 0.35,
          },
          {
            label: '7-Day Avg',
            data: rollingAvg,
            borderColor: 'rgba(245,158,11,0.7)',
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [5, 4],
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: false,
            tension: 0.4,
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
            bodyColor: '#60a5fa',
            titleFont: { family: '"DM Mono", monospace', size: 11 },
            bodyFont: { family: '"DM Mono", monospace', size: 13, weight: '500' },
            padding: 12,
            callbacks: {
              label: (ctx) => {
                if (ctx.datasetIndex === 0) return ` ${ctx.parsed.y} kg`;
                return ` avg: ${ctx.parsed.y} kg`;
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
            grid: { color: 'rgba(50,58,78,0.5)', drawBorder: false },
            border: { display: false },
            ticks: {
              color: '#6b7a99',
              font: { family: '"DM Mono", monospace', size: 10 },
              maxTicksLimit: 5,
              callback: (v) => `${v} kg`,
            },
          },
        },
        animation: { duration: 700, easing: 'easeOutQuart' },
      },
    });

    return () => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-forge-500 font-mono text-xs" style={{ height }}>
        No weight data — start logging your weight
      </div>
    );
  }

  return (
    <div style={{ height, position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default WeightChart;
