import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          primary: "#E8450A",
          accent:  "#FF6B35",
          navy:    "#1a1a2e",
          light:   "#fff1eb",
          muted:   "#fde8df",
        },
      },
    },
  },
  plugins: [],
};
export default config;
