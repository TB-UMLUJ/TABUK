/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Zain', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#E5F3EE',
          DEFAULT: '#008755',
          dark: '#006640',
        },
        accent: {
          light: '#E2E1D2',
          DEFAULT: '#9b945f',
          dark: '#B5B197',
        },
        brand: {
          light: '#E5F5FF',
          DEFAULT: '#009ACE',
          dark: '#0076A2',
        },
        danger: {
          DEFAULT: '#C8102E',
        },
        gray: {
          50: '#F7F9FA',
          100: '#EFF2F3',
          200: '#DEE3E6',
          300: '#d1d5db',
          400: '#9CB7C7',
          500: '#7E8F99',
          600: '#4b5563',
          700: '#454F5B',
          800: '#212B36',
          900: '#161C24'
        }
      }
    }
  },
  plugins: [],
}
