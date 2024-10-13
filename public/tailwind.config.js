// public/tailwind.config.js
module.exports = {
  content: [
    "./*.html",
    "./app.js",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#333333',
        vibrantOrange: '#FF5733',
        steelGray: '#B0B4B6',
        iceWhite: '#F7F7F7',
        softBlue: '#87CEEB',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
