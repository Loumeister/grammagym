/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./*.{tsx,ts}",
    "./components/**/*.{tsx,ts}",
    "./screens/**/*.{tsx,ts}",
    "./hooks/**/*.{tsx,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}