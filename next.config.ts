import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The whole site is static — no data fetching, no route handlers, no next/image.
  // Exporting plain files means Netlify needs no Next.js runtime to serve it.
  output: "export",
  // next/image cannot run its optimizer in a static export; serving the files
  // as-is still buys lazy loading and reserved space (no layout shift).
  images: { unoptimized: true },
};

export default nextConfig;
