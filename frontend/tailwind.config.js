/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ---- base: deep midnight-teal, never pure black -------------------------
        abyss: {
          950: '#05080D',
          900: '#080D14',
          850: '#0B131C',
          800: '#0F1A26',
          750: '#14222F',
          700: '#1A2B3A',
        },
        rim: {
          DEFAULT: '#1D3243',
          soft: '#16283A',
          bright: '#2A4A63',
        },
        // ---- cold accent: glacier cyan ------------------------------------------
        glacier: {
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        // ---- the thermal ramp: cold -> safe -> warm -> critical ----------------
        thermal: {
          frost: '#60A5FA',
          safe: '#3DDC97',
          warm: '#FFC24B',
          hot: '#FF7A45',
          crit: '#FF5C7A',
        },
        // ---- secondary accent: periwinkle for chain-of-custody / ML ------------
        orbit: {
          300: '#C4B5FD',
          400: '#A78BFF',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        cream: {
          DEFAULT: '#E8F2F8',
          dim: '#A7BCD0',
          faint: '#6F8AA3',
        },
      },
      // the design leans on fine-grained tints (e.g. `bg-thermal-crit/12`), so the
      // whole 0-100 scale is exposed instead of Tailwind's 5-step default
      opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, String(i / 100)])),
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(232,242,248,0.04) inset, 0 18px 40px -24px rgba(0,0,0,0.9)',
        lift: '0 22px 50px -22px rgba(6,182,212,0.35)',
        glowsafe: '0 0 0 1px rgba(61,220,151,0.25), 0 0 28px -6px rgba(61,220,151,0.45)',
        glowcrit: '0 0 0 1px rgba(255,92,122,0.3), 0 0 34px -6px rgba(255,92,122,0.5)',
        innerline: 'inset 0 0 0 1px rgba(232,242,248,0.04)',
      },
      backgroundImage: {
        'thermal-bar':
          'linear-gradient(90deg,#60A5FA 0%,#06B6D4 25%,#3DDC97 50%,#FFC24B 72%,#FF7A45 86%,#FF5C7A 100%)',
        'sheen': 'linear-gradient(115deg,transparent 0%,rgba(232,242,248,0.06) 50%,transparent 100%)',
      },
      keyframes: {
        aurora: {
          '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(6%,-4%,0) scale(1.12)' },
          '66%': { transform: 'translate3d(-5%,5%,0) scale(0.94)' },
        },
        pulsering: {
          '0%': { transform: 'scale(0.55)', opacity: '0.65' },
          '70%': { opacity: '0' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        pulsedot: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.25', transform: 'scale(0.72)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideinright: {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideinbottom: {
          from: { transform: 'translateY(14px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        popin: {
          '0%': { transform: 'scale(0.86)', opacity: '0' },
          '60%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        drawline: {
          from: { strokeDashoffset: '400' },
          to: { strokeDashoffset: '0' },
        },
        sweep: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(320%)' },
        },
        flashcrit: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(255,92,122,0)' },
          '25%': { boxShadow: '0 0 0 4px rgba(255,92,122,0.28)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        aurora: 'aurora 26s ease-in-out infinite',
        aurora2: 'aurora 34s ease-in-out infinite reverse',
        pulsering: 'pulsering 2.4s cubic-bezier(0.2,0.6,0.3,1) infinite',
        pulsedot: 'pulsedot 1.5s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        slideinright: 'slideinright 0.3s cubic-bezier(0.16,1,0.3,1)',
        slideinbottom: 'slideinbottom 0.35s cubic-bezier(0.16,1,0.3,1)',
        popin: 'popin 0.4s cubic-bezier(0.16,1,0.3,1)',
        drawline: 'drawline 1.2s ease-out forwards',
        sweep: 'sweep 2.4s ease-in-out infinite',
        flashcrit: 'flashcrit 1.1s ease-in-out',
        floaty: 'floaty 5s ease-in-out infinite',
        spiny: 'spin 2.6s linear infinite',
      },
    },
  },
  plugins: [],
}
