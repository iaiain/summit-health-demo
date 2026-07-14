/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C2B2A',
        mist: '#F5F6F2',
        surface: '#FFFFFF',
        pine: {
          DEFAULT: '#2F6F63',
          light: '#DCEAE6',
          dark: '#20504A',
        },
        sunrise: {
          DEFAULT: '#E8734F',
          light: '#FBE3D9',
        },
        fog: '#7C8F97',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
