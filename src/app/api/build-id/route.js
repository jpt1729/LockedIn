// pages/api/build-id.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const buildId = fs.readFileSync(path.join(process.cwd(), '.next', 'BUILD_ID'), 'utf8');
  res.status(200).json({ buildId });
}
