import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The whole site is static — no data fetching, no route handlers, no next/image.
  // Exporting plain files means Netlify needs no Next.js runtime to serve it.
  output: "export",
};

export default nextConfig;
