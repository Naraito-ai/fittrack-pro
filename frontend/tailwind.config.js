/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
        body:    ['"Barlow"', 'sans-serif'],
      },
      colors: {
        forge: {
          950: '#0a0c10', 900: '#0f1117', 850: '#13161e',
          800: '#181c26', 750: '#1e2330', 700: '#252b38',
          600: '#323a4e', 500: '#445066', 400: '#6b7a99', 300: '#94a3b8',
        },
        amber:     { 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        lime:      { 400: '#a3e635', 500: '#84cc16' },
        crimson:   { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
        azure:     { 400: '#60a5fa', 500: '#3b82f6' },
        tangerine: { 400: '#fb923c', 500: '#f97316' },
        teal:      { 400: '#2dd4bf', 500: '#14b8a6' },
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      boxShadow: {
        forge:        '0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.4)',
        'forge-lg':   '0 0 0 1px rgba(255,255,255,0.06), 0 8px 40px rgba(0,0,0,0.6)',
        'amber-glow': '0 0 20px rgba(245,158,11,0.25)',
      },
    },
  },
  plugins: [],
};
