const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["en-US"],
    defaultLocale: "en-US",
    domains: []
  },
  images: {
    domains: ["www.gravatar.com"]
  },
  async rewrites() {
    return [
      {
        source: "/backend",
        destination: "http://localhost:5757"
      }
    ];
  }
};

module.exports = withBundleAnalyzer(nextConfig);
