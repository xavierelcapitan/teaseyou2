// next.config.js fichier config pour nextjs
const withTM = require('next-transpile-modules')([
  '@ffmpeg/ffmpeg',
  '@ffmpeg/core',
]);

module.exports = withTM({
  reactStrictMode: true,
});
