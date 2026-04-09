import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef9f7',
          100: '#d5f0ec',
          200: '#aee1db',
          300: '#7dccc4',
          400: '#4db0a8',
          500: '#2e9690',
          600: '#237874',
          700: '#1e615e',
          800: '#1b4f4d',
          900: '#1a4140',
        },
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
