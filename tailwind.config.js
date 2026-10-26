/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        foreground: "var(--text)",
        theme: {
          bg: "var(--bg)",
          card: "var(--card)",
          border: "var(--border)",
          text: "var(--text)",
          muted: "var(--text-muted)",
          primary: "var(--primary)",
          success: "var(--success)",
          locked: "var(--locked)",
        },
      },
      boxShadow: {
        glow: "0 0 25px -5px var(--primary)",
        'glow-success': "0 0 25px -5px var(--success)",
        'glow-locked': "0 0 25px -5px var(--locked)",
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
};
