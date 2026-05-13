import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#101113",
        panel: "#17191d",
        panelSoft: "#1f2228",
        stroke: "#2c3038",
        text: "#f4f7fb",
        muted: "#a6adbb",
        brand: "#34d399",
        amber: "#f8c14a",
        danger: "#fb7185"
      },
      boxShadow: {
        clean: "0 18px 55px rgba(0,0,0,.22)"
      }
    }
  },
  plugins: []
};

export default config;
