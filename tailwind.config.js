/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './screens/**/*.{js,ts,tsx}',
    './navigation/**/*.{js,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#ff4930',      // NagaCare coral red
        secondary: '#643fb3',    // NagaCare purple
        accent: '#fccb10',       // NagaCare yellow
      },
    },
  },
  plugins: [],
};
