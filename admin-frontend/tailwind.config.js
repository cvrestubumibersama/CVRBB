/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#D42027",
          dark: "#A9181D",
        },
      },
    },
  },
  plugins: [],
};
