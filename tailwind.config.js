/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: 'var(--void)',
        'deep-space': 'var(--deep-space)',
        nebula: 'var(--nebula)',
        gold: {
          DEFAULT: 'var(--gold)',
          glow: 'var(--gold-glow)',
        },
        'star-white': 'var(--star-white)',
        mist: 'var(--mist)',
        navy: {
          DEFAULT: 'rgb(var(--navy-rgb) / <alpha-value>)',
          light: 'rgb(var(--navy-light-rgb) / <alpha-value>)',
          glass: 'var(--navy-glass)',
        },
        amber: {
          DEFAULT: '#D4A853',
          light: '#E8C97A',
          tint: 'rgba(212, 168, 83, 0.15)',
        },
        cream: 'rgb(var(--cream-rgb) / <alpha-value>)',
        teal: {
          DEFAULT: '#4ECDC4',
          light: '#6EDDD6',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        landing: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.4s ease-out forwards',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
        'mesh-drift': 'meshDrift 20s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 80%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '40%': { opacity: '1', transform: 'scale(1)' },
        },
        meshDrift: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(2%, -2%) scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
