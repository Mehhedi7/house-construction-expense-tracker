import type { Config } from 'tailwindcss';

export default <Config>{
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#fafafa',
        surface: '#ffffff',
        primary: '#2e7d32', // deep green accent
        text: '#212121',
        muted: '#757575',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        bengali: ['"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
