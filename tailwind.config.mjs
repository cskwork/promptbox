/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e0',
          300: '#b1b8c4',
          400: '#7d869a',
          500: '#525c70',
          600: '#3a4358',
          700: '#2a3145',
          800: '#1a1f30',
          900: '#0e111c',
          950: '#070912',
        },
        accent: {
          400: '#7c9cff',
          500: '#5a7dff',
          600: '#3f5fe8',
        },
      },
    },
  },
  plugins: [],
};
