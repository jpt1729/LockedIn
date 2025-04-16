/** @type {import('next').NextConfig} */
import fs from 'fs'
import path from 'path'


const nextConfig = {
  generateBuildId: async () => {
    // This could be anything, using the latest git hash
    const buildId = fs.readFileSync(path.join(__dirname, "../.next/BUILD_ID"), "utf8");
    return buildId
  },
};

export default nextConfig;
