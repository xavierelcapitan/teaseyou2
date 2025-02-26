// next.config.js — version simplifiée et 100 % CommonJS

/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')([
  '@ffmpeg/ffmpeg',
  '@ffmpeg/core',
]);

module.exports = withTM({
  reactStrictMode: true,
});