import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Inter"',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        primary: {
          DEFAULT: '#0071E3',
          50:  '#EBF4FF',
          100: '#D6E9FF',
          200: '#ADD3FF',
          300: '#84BDFF',
          400: '#5BA7FF',
          500: '#0071E3',
          600: '#005BB6',
          700: '#004589',
          800: '#002F5C',
          900: '#00192F',
        },
        accent: {
          purple: '#6366F1',
          violet: '#8B5CF6',
        },
        surface: {
          DEFAULT: '#F5F5F7',
          card:    '#FFFFFF',
          border:  '#E5E5EA',
        },
        text: {
          primary:   '#1D1D1F',
          secondary: '#6E6E73',
          tertiary:  '#AEAEB2',
        },
        status: {
          urgent: '#FF3B30',
          medium: '#FF9500',
          low:    '#34C759',
          info:   '#0071E3',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        apple:    '0 2px 20px rgba(0,0,0,0.08)',
        'apple-md': '0 4px 30px rgba(0,0,0,0.10)',
        'apple-lg': '0 8px 40px rgba(0,0,0,0.12)',
        card:     '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.05)',
        glow:     '0 0 20px rgba(0,113,227,0.25)',
        'glow-purple': '0 0 20px rgba(99,102,241,0.25)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0071E3 0%, #6366F1 100%)',
        'gradient-accent':  'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-hero':    'linear-gradient(135deg, #EBF4FF 0%, #F0EEFF 50%, #F5F5F7 100%)',
        'gradient-card':    'linear-gradient(135deg, rgba(0,113,227,0.05) 0%, rgba(99,102,241,0.05) 100%)',
        'gradient-ai':      'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)',
        'gradient-warm':    'linear-gradient(135deg, rgba(255,59,48,0.06) 0%, rgba(255,149,0,0.06) 100%)',
      },
      animation: {
        'fade-in':        'fadeIn 0.45s ease-out both',
        'slide-up':       'slideUp 0.45s ease-out both',
        'slide-in-right': 'slideInRight 0.3s ease-out both',
        'pulse-slow':     'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':        'shimmer 2s ease-in-out infinite',
        'bounce-subtle':  'bounceSub 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        bounceSub: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-3px)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
