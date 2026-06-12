const { platformSelect } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 12px)',
      },
    colors: {
    background: "#F8F5EE",
    foreground: "#1F3A32",

    primary: "#0F766E",
    secondary: "#E8D8A8",

    card: "#FFFFFF",
    border: "#E5E7EB",

    cream: "#F8F5EE",
    gold: "#C9A227",
    navy: "#1E3A5F",
    "emerald-soft": "#5FAF87",
  },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'Scheherazade New', 'serif'],
      },
    },
  },
  plugins: [],
};

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return platformSelect({
        ios: `oklch(var(--${variableName}) / ${opacityValue})`,
        android: `oklch(var(--android-${variableName}) / ${opacityValue})`,
        default: `oklch(var(--${variableName}) / ${opacityValue})`,
      });
    }
    return platformSelect({
      ios: `oklch(var(--${variableName}))`,
      android: `oklch(var(--android-${variableName}))`,
      default: `oklch(var(--${variableName}))`,
    });
  };
}
