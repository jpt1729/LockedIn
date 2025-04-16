// scripts/inject-build-id.js
const fs = require('fs');
const { execSync } = require('child_process');

const gitHash = execSync('git rev-parse --short HEAD').toString().trim();

fs.writeFileSync('.env.local', `NEXT_PUBLIC_BUILD_ID=${gitHash}\n`);

console.log('✅ Build ID written to .env.local:', gitHash);
