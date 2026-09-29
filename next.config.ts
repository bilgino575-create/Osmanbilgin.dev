import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // source maps for the shipped bundles (Lighthouse best-practices audit; also useful in production devtools)
  productionBrowserSourceMaps: true,
};

export default nextConfig;
