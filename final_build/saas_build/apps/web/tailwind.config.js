/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#F0FAF5',
          100: '#C3E8D8',
          500: '#1A7F5A',
          600: '#166B4A',
          700: '#125A3D',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'slide-in': { from: { opacity: '0', transform: 'translateX(100%)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'fade-up':  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'slide-in': 'slide-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-up':  'fade-up 0.4s ease forwards',
      },
    },
  },
  plugins: [],
};
