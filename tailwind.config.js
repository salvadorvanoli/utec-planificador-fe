import PrimeUI from 'tailwindcss-primeui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts,scss}'],
  darkMode: ['selector', '[class~="p-dark"]'],
  plugins: [PrimeUI],
};
