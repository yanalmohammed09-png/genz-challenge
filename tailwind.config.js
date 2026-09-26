/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#060B18",
          light: "#0C1730",
          lighter: "#132244"
        },
        electric: {
          DEFAULT: "#2DA9FF",
          bright: "#4FC3FF",
          dim: "#1B7FC4"
        }
      },
      fontFamily: {
        sans: ["Inter", "Tajawal", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 24px rgba(45,169,255,0.35)"
      }
    }
  },
  plugins: []
};
