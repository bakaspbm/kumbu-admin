import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        kumbu: {
          red: "#C62828",
          "red-dark": "#B71C1C",
          "red-soft": "#FFEBEE",
          purple: "#6A1B9A",
          blue: "#1A237E",
          navy: "#1E293B",
          ink: "#0F172A",
          chip: "#ECEFF1",
          delivery: "#2E7D32",
          badge: "#E53935",
          bg: "#F5F5F5",
        },
      },
      backgroundImage: {
        "kumbu-gradient":
          "linear-gradient(90deg, #D32F2F 0%, #6A1B9A 45%, #1A237E 100%)",
        "kumbu-gradient-soft":
          "linear-gradient(135deg, rgba(211,47,47,0.08) 0%, rgba(106,27,154,0.08) 45%, rgba(26,35,126,0.08) 100%)",
      },
      borderRadius: {
        chip: "12px",
        card: "16px",
        xl2: "20px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)",
        pop: "0 8px 28px rgba(15, 23, 42, 0.12)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
