import type { NextConfig } from "next";

// STATIC_EXPORT=1 erzeugt eine reine HTML/CSS/JS-Version im Ordner "out" (npm run export).
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_STATIC_EXPORT: staticExport ? "1" : "0" },
  ...(staticExport ? { output: "export" as const, trailingSlash: false, assetPrefix: ".", images: { unoptimized: true } } : {}),
  // Cache Components (PPR) und statischer Export schließen sich aus.
  ...(staticExport ? {} : { cacheComponents: true, partialPrefetching: true }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
