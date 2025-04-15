
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Add PicoCareer custom colors
        picocareer: {
          primary: "#3B82F6", // Blue
          secondary: "#1E40AF", // Darker Blue
          accent: "#60A5FA", // Light Blue
          light: "#EFF6FF", // Very Light Blue
          dark: "#1E3A8A", // Very Dark Blue
          black: "#0F172A", // Almost Black
          gray: "#64748B", // Medium Gray
          "gray-light": "#F1F5F9", // Light Gray
          success: "#10B981", // Green
          warning: "#F59E0B", // Amber
          error: "#EF4444", // Red
        },
        kahra: {
          primary: "#8B5CF6", // Purple
          secondary: "#7C3AED", // Dark Purple
          accent: "#A78BFA", // Light Purple
          light: "#F5F3FF", // Very Light Purple
          dark: "#4C1D95", // Very Dark Purple
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        serif: ["Georgia", "Times New Roman", "serif"],
        mono: ["Consolas", "Monaco", "Courier New", "monospace"],
        dyslexic: ["OpenDyslexic", "Comic Sans MS", "sans-serif"],
        rounded: ["system-ui", "-apple-system", "sans-serif"],
        // Add new font families
        inter: ["Inter", "system-ui", "sans-serif"],
        roboto: ["Roboto", "Arial", "sans-serif"],
        poppins: ["Poppins", "system-ui", "sans-serif"],
        comic: ["Comic Sans MS", "Comic Sans", "cursive"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0)"
          },
          "50%": {
            transform: "translateY(-10px)"
          }
        },
        "fadeIn": {
          "0%": {
            opacity: "0"
          },
          "100%": {
            opacity: "1"
          }
        },
        "popIn": {
          "0%": {
            transform: "scale(0.5)",
            opacity: "0"
          },
          "70%": {
            transform: "scale(1.05)",
            opacity: "1"
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(({ addUtilities }) => {
      addUtilities({
        ".text-balance": {
          "text-wrap": "balance",
        },
      })
    }),
  ],
} satisfies Config

export default config
