/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        card: '#131B2E',
        'card-border': '#1E293B',
      },
      animation: {
        'pulse-burnout': 'pulseBurnout 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseBurnout: {
          '0%, 100%': {
            backgroundColor: 'rgba(239, 68, 68, 0.95)',
            boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.8), 0 0 15px rgba(239, 68, 68, 0.5)',
            transform: 'scale(1)',
          },
          '50%': {
            backgroundColor: 'rgba(185, 28, 28, 0.85)',
            boxShadow: '0 0 0 10px rgba(239, 68, 68, 0), 0 0 25px rgba(239, 68, 68, 0.8)',
            transform: 'scale(1.08)',
          },
        },
      },
    },
  },
  plugins: [],
}
