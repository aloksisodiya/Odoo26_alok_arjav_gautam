/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0c',        // Deep operational black
          surface: '#121216',   // Cards & Panels
          border: '#22222a',    // Technical borders
          cardBg: '#16161a',
          hoverBg: '#1e1e24',
          mutedText: '#8e8e9f'
        },
        brand: {
          DEFAULT: '#d97706',   // Amber/orange operational color
          light: '#fbbf24',
          dark: '#b45309'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'Courier', 'monospace']
      }
    },
  },
  plugins: [],
}
