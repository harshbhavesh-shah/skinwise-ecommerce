import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product thumbnails are locally-generated placeholder SVGs.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },
};

export default nextConfig;
