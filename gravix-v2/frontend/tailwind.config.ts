import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Brand colors (dark backgrounds)
        brand: {
          900: '#0A1628', // primary bg
          800: '#111827', // card bg
          700: '#1F2937', // elevated
          600: '#374151', // borders
        },
        // Accent colors (primary interactive)
        accent: {
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#6366F1',
        // Text colors
        text: {
          primary: '#F9FAFB',
          secondary: '#9CA3AF',
          tertiary: '#6B7280',
        },
        // Elevation levels (for surface colors)
        surface: {
          0: '#0A1628',
          1: '#111827',
          2: '#1F2937',
          3: '#374151',
          4: '#4B5563',
        },
      },
      spacing: {
        // 4px base system
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '13': '52px',
        '14': '56px',
        '15': '60px',
        '16': '64px',
        '17': '68px',
        '18': '72px',
        '19': '76px',
        '20': '80px',
      },
      borderRadius: {
        DEFAULT: '4px',
        none: '0',
        sm: '2px',
        md: '4px',
        lg: '4px',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        heading: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      transitionTimingFunction: {
        'out-crisp': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-crisp': 'cubic-bezier(0.7, 0, 0.84, 0)',
        'in-out-crisp': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
      transitionDuration: {
        instant: '75ms',
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
        deliberate: '600ms',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 250ms ease-out-crisp',
        slideDown: 'slideDown 250ms ease-out-crisp',
        slideUp: 'slideUp 250ms ease-out-crisp',
        slideRight: 'slideRight 250ms ease-out-crisp',
        scaleIn: 'scaleIn 200ms ease-out-crisp',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
