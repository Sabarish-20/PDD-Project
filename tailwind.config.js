/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Lora_400Regular'],
        sans: ['Inter_400Regular'],
      },
    },
  },
  plugins: [],
}
