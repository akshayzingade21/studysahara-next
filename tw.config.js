// tw.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
    "./styles/**/*.{css}",       // include your CSS entry
  ],
  theme: { extend: {} },
  plugins: [],
};