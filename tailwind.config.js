/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        geek: {
          50: '#f0f6ff',
          100: '#e0edff',
          200: '#b8d4fe',
          300: '#7cb3fd',
          400: '#3889f9',
          500: '#0d6efd',
          600: '#0250d4',
          700: '#033ea8',
          800: '#07348a',
          900: '#0c2e72',
          950: '#0d1117',
        },
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'scan-line': 'scan 8s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
      },
    },
  },
  plugins: [],
}
