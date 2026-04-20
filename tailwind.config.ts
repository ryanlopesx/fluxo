import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core palette
        bg:      '#0D0D0D',
        surface: '#131313',
        raised:  '#1A1A1A',
        overlay: '#212121',
        line:    '#2A2A2A',
        'line-2':'#373737',

        // Text
        ink:     '#EFEFEF',
        'ink-2': '#9A9A9A',
        'ink-3': '#555555',

        // Accent
        green:   '#1DB954',
        'green-2':'#169140',
        'green-dim': '#0D5225',

        // Funnel stages
        tofu:    '#4B8FE8',
        mofu:    '#D98C00',
        bofu:    '#1DB954',

        // States
        danger:  '#E5534B',
        warning: '#C59B00',
        rehook:  '#9D7FEA',

        // Legacy aliases (keeps existing components working)
        primary:   '#EFEFEF',
        secondary: '#9A9A9A',
        muted:     '#555555',
        elevated:  '#1A1A1A',
        brand:     '#1DB954',
        accent:    '#9D7FEA',
        border:    '#2A2A2A',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        'fade-up': 'fade-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
