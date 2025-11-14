/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        elevas: {
          primary: {
            50: "var(--elevas-primary-50)",
            100: "var(--elevas-primary-100)",
            200: "var(--elevas-primary-200)",
            300: "var(--elevas-primary-300)",
            400: "var(--elevas-primary-400)",
            500: "var(--elevas-primary-500)",
            600: "var(--elevas-primary-600)",
            700: "var(--elevas-primary-700)",
            800: "var(--elevas-primary-800)",
            900: "var(--elevas-primary-900)",
            DEFAULT: "var(--elevas-primary-500)",
          },
          accent: {
            50: "var(--elevas-accent-50)",
            100: "var(--elevas-accent-100)",
            200: "var(--elevas-accent-200)",
            300: "var(--elevas-accent-300)",
            400: "var(--elevas-accent-400)",
            500: "var(--elevas-accent-500)",
            600: "var(--elevas-accent-600)",
            700: "var(--elevas-accent-700)",
            800: "var(--elevas-accent-800)",
            900: "var(--elevas-accent-900)",
            DEFAULT: "var(--elevas-accent-400)",
          },
          neutral: {
            50: "var(--elevas-neutral-50)",
            100: "var(--elevas-neutral-100)",
            200: "var(--elevas-neutral-200)",
            300: "var(--elevas-neutral-300)",
            400: "var(--elevas-neutral-400)",
            500: "var(--elevas-neutral-500)",
            600: "var(--elevas-neutral-600)",
            700: "var(--elevas-neutral-700)",
            800: "var(--elevas-neutral-800)",
            900: "var(--elevas-neutral-900)",
            DEFAULT: "var(--elevas-neutral-500)",
          },
          success: {
            50: "var(--elevas-success-50)",
            100: "var(--elevas-success-100)",
            500: "var(--elevas-success-500)",
            600: "var(--elevas-success-600)",
            DEFAULT: "var(--elevas-success-500)",
          },
          warning: {
            50: "var(--elevas-warning-50)",
            100: "var(--elevas-warning-100)",
            500: "var(--elevas-warning-500)",
            600: "var(--elevas-warning-600)",
            DEFAULT: "var(--elevas-warning-500)",
          },
        },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}