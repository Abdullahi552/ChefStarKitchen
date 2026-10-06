export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#C9A227', dark: '#8A6D0B' },
        cream: '#FBF9F4', sand: '#F2EDF9', ink: '#1E0F3D',
        royal: { DEFAULT: '#4B2A8A', dark: '#2A1458', deep: '#170A33' },
      },
      fontFamily: { serif: ['"Cormorant Garamond"', 'serif'], sans: ['Montserrat', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
