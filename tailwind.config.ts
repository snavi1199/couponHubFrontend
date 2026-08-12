import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EFEDE4',
        card: '#FFFFFF',
        ink: '#16241B',
        'ink-soft': '#3D4A3F',
        brand: {
          DEFAULT: '#2F6B4F',
          dark: '#1F4B37',
          light: '#DCE9E1',
        },
        stamp: {
          DEFAULT: '#E8611C',
          dark: '#C44E11',
          light: '#FBE3D3',
        },
        line: '#C9C2AE',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'ticket-notch-left':
          'radial-gradient(circle at 0 50%, transparent 10px, #FFFFFF 10.5px)',
      },
    },
  },
  plugins: [],
} satisfies Config
