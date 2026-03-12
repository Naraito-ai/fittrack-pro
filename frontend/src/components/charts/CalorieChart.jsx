import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const CalorieChart = ({ data = [], targetCalories = 2000, days = 7 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy previous instance
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');

    // Build full date range (fill missing days with 0)
    const dateMap = {};
    data.forEach(d => { dateMap[d._id] = d.totalCalories; });

    const labels = [];
    const values = [];
    const colors = [];
    const borderColors = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const cal = dateMap[key] || 0;
      const isOver = cal > targetCalories;
      const isToday = i === 0;

      labels.push(dayLabel);
      values.push(Math.round(cal));
      colors.push(
        isToday ? 'rgba(245,158,11,0.7)' :
        isOver  ? 'rgba(239,68,68,0.55)' :
                  'rgba(245,158,11,0.25)'
      );
      borderColors.push(
        isToday ? '#f59e0b' :
        isOver  ? '#ef4444' :
                  'rgba(245,158,11,0.5)'
      );
    }

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Calories',
          data: values,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 6,
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
            bodyColor: '#fbbf24',
            titleFont: { family: '"DM Mono", monospace', size: 11 },
            bodyFont: { family: '"DM Mono", monospace', size: 13, weight: '500' },
            padding: 10,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y.toLocaleString()} kcal`,
              afterLabel: (ctx) => {
                const diff = ctx.parsed.y - targetCalories;
                if (diff === 0) return '';
                return diff > 0 ? ` +${diff} over target` : ` ${Math.abs(diff)} under target`;
              },
            },
          },
          annotation: undefined,
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#6b7a99',
              font: { family: '"DM Mono", monospace', size: 11 },
            },
          },
          y: {
            grid: {
              color: 'rgba(50,58,78,0.5)',
              drawBorder: false,
            },
            border: { display: false, dash: [4, 4] },
            ticks: {
              color: '#6b7a99',
              font: { family: '"DM Mono", monospace', size: 10 },
              maxTicksLimit: 5,
              callback: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v,
            },
            min: 0,
          },
        },
        animation: {
          duration: 600,
          easing: 'easeOutQuart',
        },
      },
    });

    // Draw target line manually after render
    const originalDraw = chartRef.current.draw.bind(chartRef.current);
    chartRef.current.draw = function() {
      originalDraw();
      const chart = chartRef.current;
      if (!chart) return;
      const yScale = chart.scales.y;
      const xScale = chart.scales.x;
      if (!yScale || !xScale) return;
      const targetY = yScale.getPixelForValue(targetCalories);
      if (targetY < yScale.top || targetY > yScale.bottom) return;
      const ctxDraw = chart.ctx;
      ctxDraw.save();
      ctxDraw.setLineDash([6, 4]);
      ctxDraw.strokeStyle = 'rgba(245,158,11,0.4)';
      ctxDraw.lineWidth = 1.5;
      ctxDraw.beginPath();
      ctxDraw.moveTo(xScale.left, targetY);
      ctxDraw.lineTo(xScale.right, targetY);
      ctxDraw.stroke();
      ctxDraw.setLineDash([]);
      ctxDraw.font = '10px "DM Mono", monospace';
      ctxDraw.fillStyle = 'rgba(245,158,11,0.6)';
      ctxDraw.fillText(`${targetCalories} target`, xScale.right - 80, targetY - 4);
      ctxDraw.restore();
    };

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, targetCalories, days]);

  return (
    <div style={{ height: '180px', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CalorieChart;
