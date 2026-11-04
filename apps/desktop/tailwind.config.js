/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./renderer/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui-components/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          maroon: '#800D32',
          maroonDark: '#600821',
          maroonLight: '#A31542',
          pink: '#F9E8ED',
          pinkBorder: '#F3D2DC',
          bg: '#FAF8F9',
          text: '#191923',
          success: '#239B56',
          warning: '#E9A23B',
          error: '#DC4545',
        },
      },
    },
  },
  plugins: [],
}
