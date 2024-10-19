/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/**/**.{js,jsx,ts,tsx}', // Ensure all your files are scanned
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      fontWeight:{
        'welcome-font' : '800',
      },
      fontSize:{
        'welcome-size' : '1.475rem',
      },
      colors: {
        'custom-gray': '#3E6871', // Custom gray color
        'custom-dark': '#203A40', // Darker background color for buttons
        'blue' : '#1fb6ff',
        'pink' : '#ff49db',
        'white' : '#FFFFFF',
        'icon-bg' : '#D9D9D9',
        'AllMenu' : '#FF9900',
        'Biscuits' : '#CC0000',
        'Drinks' : '#418A40',
        'Snacks' : '#197B9A',
        'Meals' : '#C7762C',
        'Cardbg' : '#FEFEFE',
        'gcash' : '#002CB8',
      },
      borderRadius: {
        '50px': '50px', // Custom border radius for containers
        '24.5px': '24.5px', // For login button
      },
      height: {
        '550px': '550px', // Custom height
      },
      width: {
        '800px': '800px', // Custom width
      },
      margin: {
        '80px': '80px', // Margin for spacing
        '5px': '5px',
        '10px': '10px',
        '25px': '25px',
      },
      spacing: {
        '537px': '537px', // Custom spacing for image
        '250px': '250px',
      },
      opacity: {
        '60': '0.6', // Custom opacity for Welcome text
      },
      screens: {
      'mobile': '320px', // Target the minimum mobile size
      'tablet': '640px', // Tablets start at 640px and above
      'laptop': '1024px',
      'desktop': '1280px',
      },
    },
  },
  plugins: [],
};