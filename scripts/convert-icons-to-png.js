#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '../public/icons');
const sizes = [16, 32, 48, 128];

console.log('🔄 正在将 SVG 图标转换为 PNG...\n');

async function convertSvgToPng() {
  for (const size of sizes) {
    const svgPath = path.join(iconsDir, `icon${size}.svg`);
    const pngPath = path.join(iconsDir, `icon${size}.png`);

    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(pngPath);

      console.log(`✅ 已转换: icon${size}.svg → icon${size}.png`);
    } catch (error) {
      console.error(`❌ 转换失败 icon${size}.svg:`, error.message);
    }
  }

  console.log('\n🎉 所有图标已转换为 PNG 格式');
  console.log('📝 下一步: 重新加载 Chrome 扩展');
}

convertSvgToPng().catch(console.error);
