import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#070A12',
          50: '#0D111C',
          100: '#121826',
          200: '#1A2235',
          300: '#232D44',
        },
        cyan: {
          DEFAULT: '#00E5FF',
          dim: '#00B8CC',
          glow: 'rgba(0, 229, 255, 0.15)',
        },
        amber: {
          DEFAULT: '#FFB020',
          dim: '#CC8C1A',
          glow: 'rgba(255, 176, 32, 0.15)',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.04)',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.06)',
        },
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        sora: ['var(--font-sora)', 'sans-serif'],
        sans: ['var(--font-sora)', 'sans-serif'],
      },
      backgroundImage: {
        'mesh-dark':
          'radial-gradient(ellipse at 20% 50%, rgba(0,229,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,100,200,0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(0,229,255,0.05) 0%, transparent 40%)',
        'mesh-light':
          'radial-gradient(ellipse at 20% 50%, rgba(0,229,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,150,200,0.08) 0%, transparent 50%)',
        'cyan-glow': 'radial-gradient(circle at center, rgba(0,229,255,0.2) 0%, transparent 70%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
