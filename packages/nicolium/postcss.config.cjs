/** @type {import('postcss-load-config').ConfigFn} */
const config = () => ({
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
});

module.exports = config;
