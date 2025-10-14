/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        midnight: {
          900: '#0a0a0a',
          800: '#111111',
          700: '#1a1a1a',
          600: '#232323',
          500: '#2d2d2d',
          400: '#404040',
          300: '#525252',
          200: '#737373',
          100: '#a3a3a3',
        },
        glow: {
          white: '#ffffff',
          'white-soft': 'rgba(255, 255, 255, 0.8)',
          'white-dim': 'rgba(255, 255, 255, 0.6)',
          'white-faint': 'rgba(255, 255, 255, 0.3)',
        }
      },
      boxShadow: {
        'glow-white': '0 0 8px rgba(255, 255, 255, 0.2), 0 0 16px rgba(255, 255, 255, 0.15), 0 0 24px rgba(255, 255, 255, 0.08)',
        'glow-white-hover': '0 0 12px rgba(255, 255, 255, 0.3), 0 0 24px rgba(255, 255, 255, 0.2), 0 0 36px rgba(255, 255, 255, 0.15)',
        'glow-white-strong': '0 0 16px rgba(255, 255, 255, 0.4), 0 0 32px rgba(255, 255, 255, 0.25), 0 0 48px rgba(255, 255, 255, 0.15)',
      },
      borderColor: {
        'glow-white': 'rgba(255, 255, 255, 0.25)',
        'glow-white-hover': 'rgba(255, 255, 255, 0.5)',
      },
      textShadow: {
        'glow-white': '0 0 8px rgba(255, 255, 255, 0.6), 0 0 16px rgba(255, 255, 255, 0.4), 0 0 24px rgba(255, 255, 255, 0.3)',
      }
    },
  },
  plugins: [],
}