/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        scada: {
          bg: "#090d12",
          panel: "#121820",
          card: "#18202c",
          border: "#232e3e",
          accent: "#f59e0b", // Amber
          cyan: "#06b6d4",   // Cyan
          green: "#10b981",  // Emerald
          red: "#ef4444",    // Red
          warning: "#f97316" // Orange
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
