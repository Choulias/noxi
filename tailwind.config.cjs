/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');
delete colors['lightBlue'];
delete colors['warmGray'];
delete colors['trueGray'];
delete colors['coolGray'];
delete colors['blueGray'];
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    colors: {
      darker: '#06122F',
      dark: '#06397B',
      main: '#95FDFC',
      secondary: '#FEBEFD',
      transparent: 'transparent',
      white: '#ffffff',
      black: '#000000',
      ...colors
    },
    fontFamily: {
      title: ['Quicksand', 'sans-serif'],
      sans: ['Poppins', 'sans-serif']
    },
    extend: {
      'home': "url('src/assets/img/home-bg.png')"
    }
  },
  plugins: [
  ],
}
