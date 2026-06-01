import type { Config } from "tailwindcss";

/**
 * Tailwind CSS configuration object.
 * 
 * This configuration extends Tailwind's default settings
 * It adds dark mode, content paths, theme extensions like colors and animations, and plugins.
 * It works with a CSS-in-JS setup using HSL colors.
 * 
 * @constant
 * @type {Config}
 * @property {("class"[])} darkMode - Configures dark mode to be toggled by the presence of a 'class' on the HTML element.
 * @property {string[]} content - An array of file paths to scan for Tailwind classes to ensure they are included in the final CSS bundle.
 * @property {object} theme - Extends Tailwind's default theme.
 * @property {object} theme.extend - Custom theme properties.
 * @property {object} theme.extend.borderRadius - Custom border-radius values, using CSS variables for consistency.
 * @property {object} theme.extend.colors - Custom color palette defined using HSL CSS variables, including semantic names and a specific 'sidebar' palette.
 * @property {object} theme.extend.keyframes - Custom keyframe animations for accordion components.
 * @property {object} theme.extend.animation - Custom animation utility classes referencing the defined keyframes.
 * @property {any[]} plugins - An array of Tailwind CSS plugins to extend its functionality, including `tailwindcss-animate` and `@tailwindcss/typography`.
 *
 * @example
 * // This configuration is automatically picked up by Tailwind CSS CLI or build tools.
 * // No direct JavaScript usage example is applicable, as it's a configuration file.
 */
export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
