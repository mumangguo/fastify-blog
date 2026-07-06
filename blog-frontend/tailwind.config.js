import { heroui } from "@heroui/react";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/react/node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/*/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/react/node_modules/@heroui/*/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#87CEEB',
          hover: '#5DB8E0',
          light: '#E0F4FC',
        },
        background: '#F5F5F7',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [
    typography,
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#87CEEB",
              foreground: "#FFFFFF",
            },
          },
        },
      },
    }),
  ],
}
