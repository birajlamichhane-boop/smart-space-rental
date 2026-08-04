/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0B',
        surface: {
          DEFAULT: '#141416',
          elevated: '#1C1C1F',
        },
        border: {
          DEFAULT: '#262626',
        },
        brand: {
          DEFAULT: '#E11D2E',
          hover: '#FF2E44',
          glow: 'rgba(225, 29, 46, 0.35)',
        },
        text: {
          primary: '#F5F5F5',
          muted: '#A1A1AA',
          caption: '#71717A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'brand-glow': '0 0 20px rgba(225, 29, 46, 0.35)',
        'red-card': '0 4px 20px -2px rgba(225, 29, 46, 0.15)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite linear',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
