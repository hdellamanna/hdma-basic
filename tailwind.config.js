/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple ][ palette — beige + phosphor green
        void: {
          DEFAULT: '#0a1808',
          deep: '#020602',
        },
        phosphor: {
          green: '#4fff4f',
          dim: '#2a8a2a',
          ghost: '#0a2a04',
        },
        amber: {
          DEFAULT: '#ffb000',
          dim: '#a06d00',
        },
        magenta: '#ff44ff',
        cyan: '#44e0ff',
        danger: '#ff4444',
        // Apple ][ beige
        beige: {
          DEFAULT: '#d6cfb8',
          dim: '#b8b094',
          dark: '#8a8470',
          darker: '#4a4630',
        },
        // Soft UI layers — true black + dark warm grays
        surface: {
          900: '#1a1814',
          800: '#222018',
          700: '#2a2820',
          600: '#3a3628',
          500: '#4a4630',
        },
        ink: {
          DEFAULT: '#cfd2c4',
          muted: '#9a9a8a',
          dim: '#5a5a4a',
        },
      },
      fontFamily: {
        mono: ['"VT323"', '"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['"Press Start 2P"', 'system-ui', 'monospace'],
      },
      boxShadow: {
        'neon-green': '0 0 8px #39ff14, 0 0 24px #39ff1488, 0 0 48px #39ff1444',
        'neon-amber': '0 0 8px #ffb000, 0 0 24px #ffb00088',
        'neon-cyan': '0 0 8px #00f0ff, 0 0 24px #00f0ff88',
        'neon-magenta': '0 0 8px #ff00ff, 0 0 24px #ff00ff88',
        'neon-red': '0 0 8px #ff2d2d, 0 0 24px #ff2d2d88',
        'inner-screen': 'inset 0 0 60px rgba(57, 255, 20, 0.08), inset 0 4px 12px rgba(0, 0, 0, 0.6)',
        'cabinet': '0 30px 60px -15px rgba(0, 0, 0, 0.9), 0 18px 36px -18px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },
      animation: {
        flicker: 'flicker 4s linear infinite',
        scan: 'scan 8s linear infinite',
        glow: 'glow 2.4s ease-in-out infinite',
        'glow-fast': 'glow 1.2s ease-in-out infinite',
        marquee: 'marquee 20s linear infinite',
        'marquee-rev': 'marquee 30s linear infinite reverse',
        'boot-up': 'boot-up 0.6s ease-out',
        'press-down': 'press-down 0.12s ease-out',
        shake: 'shake 0.4s ease-in-out',
        blink: 'blink 1.06s steps(2, start) infinite',
        'text-typing': 'text-typing 0.4s steps(20, end)',
      },
      keyframes: {
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
            opacity: '1',
            textShadow: '0 0 4px currentColor, 0 0 12px currentColor',
          },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
            opacity: '0.78',
            textShadow: 'none',
          },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glow: {
          '0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 6px currentColor)' },
          '50%': { filter: 'brightness(1.15) drop-shadow(0 0 14px currentColor)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'boot-up': {
          '0%': { opacity: '0', transform: 'scaleY(0.02)' },
          '60%': { opacity: '1', transform: 'scaleY(0.02)' },
          '100%': { opacity: '1', transform: 'scaleY(1)' },
        },
        'press-down': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(2px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'text-typing': {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.05 0 0 0 0 0.05 0 0 0 0 0.05 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
