/** @type {import('next').NextConfig} */
const nextConfig = {
  generateBuildId: async () => {
    // This could be anything, using the latest git hash
    return process.env.GIT_HASH || "dev-build";
  },
  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.GIT_HASH || "dev-build",
  },
};

export default nextConfig;
