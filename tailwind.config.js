/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,html}'],
  // eslint-disable-next-line import/no-unresolved, global-require
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'],
  },
};
