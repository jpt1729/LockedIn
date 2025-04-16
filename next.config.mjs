/** @type {import('next').NextConfig} */
import { execSync } from "child_process";
const nextConfig = {
  generateBuildId: async () => {
    // This could be anything, using the latest git hash
    return execSync("git rev-parse HEAD").toString().trim();;
  },
};

export default nextConfig;
