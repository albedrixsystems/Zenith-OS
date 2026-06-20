/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          900: '#0F172A',
          800: '#1e293b',
          700: '#334155',
        },
        brand: {
          orange: '#F4511E',
          'orange-light': '#FF6B35',
          'orange-dark': '#D13B0E',
          gradient: 'linear-gradient(135deg, #F4511E 0%, #FF8C42 100%)',
        },
        indigo: {
          500: '#4F46E5',
          600: '#4338CA',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06B6D4',
        },
        emerald: {
          500: '#10B981',
          600: '#059669',
        },
        amber: {
          500: '#F59E0B',
        },
        rose: {
          500: '#EF4444',
          600: '#DC2626',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
        brand: '0 4px 14px rgba(244, 81, 30, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-10px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
