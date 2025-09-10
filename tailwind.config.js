const { heroui } = require('@heroui/theme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    require('@tailwindcss/typography'),
    heroui({
      themes: {
        light: {
          colors: {
            background: '#FEFEFE',
            foreground: '#1A1A1A',
            primary: {
              50: '#F3F1FF',
              100: '#E9E4FF',
              200: '#D6CCFF',
              300: '#BCA4FF',
              400: '#9B78FF',
              500: '#7C3AED', // Main purple
              600: '#6D28D9',
              700: '#5B21B6',
              800: '#4C1D95',
              900: '#3C1A78',
              foreground: '#FFFFFF',
              DEFAULT: '#7C3AED',
            },
            secondary: {
              50: '#F8F4FF',
              100: '#F1E8FF',
              200: '#E5D5FF',
              300: '#D4BBFF',
              400: '#BE9EFF',
              500: '#A855F7', // Light purple
              600: '#9333EA',
              700: '#7E22CE',
              800: '#6B21A8',
              900: '#581C87',
              foreground: '#FFFFFF',
              DEFAULT: '#A855F7',
            },
            focus: '#7C3AED',
          },
        },
        dark: {
          colors: {
            background: '#0A0A0A',
            foreground: '#ECEDEE',
            primary: {
              50: '#1A0F2E',
              100: '#2D1B4E',
              200: '#44307A',
              300: '#5B46A1',
              400: '#7C3AED', // Main purple
              500: '#8B5CF6',
              600: '#A78BFA',
              700: '#C4B5FD',
              800: '#DDD6FE',
              900: '#F3F0FF',
              foreground: '#FFFFFF',
              DEFAULT: '#8B5CF6',
            },
            secondary: {
              50: '#1E1B2E',
              100: '#322951',
              200: '#4C3B7A',
              300: '#6752A1',
              400: '#A855F7', // Light purple for dark
              500: '#B794F6',
              600: '#C6A7F7',
              700: '#D6BBFC',
              800: '#E5D0FE',
              900: '#F4E8FF',
              foreground: '#FFFFFF',
              DEFAULT: '#B794F6',
            },
            focus: '#8B5CF6',
          },
        },
      },
    }),
  ],
}
