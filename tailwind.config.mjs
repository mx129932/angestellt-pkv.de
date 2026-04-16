/** @type {import('tailwindcss').Config} */
// Farbtokens 1:1 aus dem Stitch-Export (2_Design-Input/templates/*/code.html)
// Corporate Identity: "Hanseatic Palette" — Primary Navy + Tertiary Green Accents
// NO-LINE-RULE: keine 1px-Borders. Grenzen durch surface-*-Shifts.
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#002046',
        'primary-container': '#1b365d',
        'on-primary': '#ffffff',
        'on-primary-container': '#87a0cd',
        'on-primary-fixed': '#001b3d',
        'on-primary-fixed-variant': '#2e476f',
        'primary-fixed-dim': '#aec7f7',
        'inverse-primary': '#aec7f7',

        secondary: '#4c616c',
        'secondary-container': '#cfe6f2',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#526772',
        'secondary-fixed': '#cfe6f2',
        'secondary-fixed-dim': '#b4cad6',
        'on-secondary-fixed-variant': '#354a53',

        tertiary: '#00261c',
        'tertiary-container': '#7aa897',
        'tertiary-fixed': '#bcedda',
        'tertiary-fixed-dim': '#a1d1bf',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#7aa897',
        'on-tertiary-fixed': '#002118',
        'on-tertiary-fixed-variant': '#214f41',

        surface: '#f8f9fa',
        'surface-bright': '#f8f9fa',
        'surface-dim': '#d9dadb',
        'surface-tint': '#465f88',
        'surface-container': '#edeeef',
        'surface-container-low': '#f3f4f5',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#e7e8e9',
        'surface-container-highest': '#e1e3e4',
        'on-surface': '#191c1d',
        'on-surface-variant': '#44474e',
        'inverse-surface': '#2e3132',

        background: '#f8f9fa',
        'on-background': '#191c1d',

        outline: '#74777f',
        'outline-variant': '#c4c6cf',

        error: '#ba1a1a',
        'error-container': '#ffdad6',

        // Accents (Stitch)
        'amber-accent': '#D4A017',
        'amber-accent-dark': '#B8860B'
      },
      fontFamily: {
        display: ['Newsreader', 'Georgia', 'serif'],
        headline: ['Newsreader', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif']
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        md: '0.375rem',
        lg: '0.5rem'
      },
      backgroundImage: {
        'gradient-primary':
          'linear-gradient(135deg, #002046 0%, #1b365d 100%)'
      }
    }
  },
  plugins: []
};
