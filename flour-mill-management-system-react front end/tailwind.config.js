/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.jsx",
    "./App.jsx",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
    "./constants.jsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF",
        secondary: "#4B5563",
        light: "#F9FAFB",
        dark: "#111827",
      },
    },
  },
  plugins: [],
};
