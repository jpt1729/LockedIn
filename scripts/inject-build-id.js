// scripts/inject-build-id.js
const fs = require("fs");
const path = require("path");

const buildId = fs.readFileSync(path.join(__dirname, "../.next/BUILD_ID"), "utf8");
fs.writeFileSync(".env.local", `NEXT_PUBLIC_BUILD_ID=${buildId}`);
console.log("Build ID injected:", buildId);