#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保输出目录存在
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [16, 32, 48, 128];

// 创建带背景的 SVG（用于 Chrome 扩展工具栏）
function createSolidSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2E7D32;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="19.2" fill="url(#bgGradient)"/>
  <text x="32" y="64" font-family="Arial, sans-serif" font-size="68" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">{</text>
  <text x="64" y="64" font-family="Georgia, serif" font-size="42" font-weight="normal" font-style="italic" fill="white" fill-opacity="0.95" text-anchor="middle" dominant-baseline="middle">L</text>
  <text x="96" y="64" font-family="Arial, sans-serif" font-size="68" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">}</text>
</svg>`;
}

// 创建透明背景的 SVG（用于应用内）
function createTransparentSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <text x="32" y="64" font-family="Arial, sans-serif" font-size="70" font-weight="bold" fill="white" stroke="rgba(0,0,0,0.15)" stroke-width="5" text-anchor="middle" dominant-baseline="middle">{</text>
  <text x="64" y="64" font-family="Georgia, serif" font-size="44" font-weight="normal" font-style="italic" fill="white" fill-opacity="0.95" stroke="rgba(0,0,0,0.12)" stroke-width="3" text-anchor="middle" dominant-baseline="middle">L</text>
  <text x="96" y="64" font-family="Arial, sans-serif" font-size="70" font-weight="bold" fill="white" stroke="rgba(0,0,0,0.15)" stroke-width="5" text-anchor="middle" dominant-baseline="middle">}</text>
</svg>`;
}

console.log('🎨 正在生成图标...\n');

// 生成带背景的图标
sizes.forEach(size => {
  const svgContent = createSolidSVG(size);
  const filename = `icon${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ 已生成: ${filename}`);
});

// 生成透明背景图标
const transparentSvg = createTransparentSVG(128);
const transparentFilepath = path.join(iconsDir, 'icon_transparent.svg');
fs.writeFileSync(transparentFilepath, transparentSvg);
console.log(`✅ 已生成: icon_transparent.svg`);

console.log(`\n🎉 所有图标已生成到: ${iconsDir}`);
console.log('\n📝 下一步: 更新 manifest.json 配置图标路径');
