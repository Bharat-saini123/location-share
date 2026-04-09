import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#e6f1fb",
          100: "#b5d4f4",
          200: "#85b7eb",
          400: "#378add",
          600: "#185fa5",
          800: "#0c447c",
          900: "#042c53",
        },
      },
    },
  },
  plugins: [],
};
export default config;
