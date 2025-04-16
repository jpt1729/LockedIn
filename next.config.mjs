/** @type {import('next').NextConfig} */
const fs = require("fs");
const path = require("path");


const nextConfig = {
  generateBuildId: async () => {
    // This could be anything, using the latest git hash
    const buildId = fs.readFileSync(path.join(__dirname, "../.next/BUILD_ID"), "utf8");
    return buildId
  },
};

export default nextConfig;
