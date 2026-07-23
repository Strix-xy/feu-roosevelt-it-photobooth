/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  // Keep Turbopack rooted on this app (avoids picking a parent lockfile)
  turbopack: {
    root: path.join(__dirname),
  },
};

module.exports = nextConfig;
