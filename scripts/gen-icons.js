import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function makeIconSVG(size) {
  const r = Math.round(size * 0.18);
  const fontSize = Math.round(size * 0.55);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#b93824"/>
  <text x="50%" y="54%" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle"
    font-family="Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,sans-serif">🍽️</text>
</svg>`;
}

[192, 512].forEach(size => {
  const p = path.join(outDir, `icon-${size}.svg`);
  fs.writeFileSync(p, makeIconSVG(size));
  console.log('✅', p);
});

const faviconPath = path.join(__dirname, '..', 'public', 'favicon.svg');
fs.writeFileSync(faviconPath, makeIconSVG(32));
console.log('✅', faviconPath);
console.log('\nSVG icons written to public/icons/');
