/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marsa: {
          navy: '#113E6C',
          blue: '#1881BC',
          cyan: '#00A3E0',
          dark: '#0B2238',
        },
        deep: {
          950: '#030712',
          900: '#050D1A',
          850: '#071224',
          800: '#0A1B33',
          750: '#0E2445',
          700: '#14315C',
        },
        electric: {
          cyan: '#00F0FF',
          blue: '#00A8FF',
          teal: '#00E5C8',
        },
        industrial: {
          amber: '#F59E0B',
          emerald: '#10B981',
          danger: '#EF4444',
          alert: '#F97316',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
        'flow': 'flowDash 1.5s linear infinite',
        'radar': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.8))' },
        },
        flowDash: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px)",
        'mesh-dark': "radial-gradient(circle at 50% 0%, rgba(24, 129, 188, 0.15) 0%, transparent 60%)",
      }
    },
  },
  plugins: [],
}
