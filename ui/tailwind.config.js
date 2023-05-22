/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
            'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primary1: '#404040',
        primary2: '#333333',
        primary3: '#232323',
        secondary1: '#39B44A',
        secondary2: '#F5F5F5',
      }
    },
  },
  plugins: [],
}

