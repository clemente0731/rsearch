import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// svg template for icon
function createSvg(size) {
  const radius = Math.round(size * 0.125);
  const fontSize = Math.round(size * 0.6875);
  const textY = Math.round(size * 0.75);
  const center = size / 2;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#dc2626"/>
  <text x="${center}" y="${textY}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff" text-anchor="middle">R</text>
</svg>`;
}

async function generateIcons() {
  const sizes = [16, 48, 128];
  
  // check if sharp is available
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch (e) {
    console.log('sharp not installed. run: npm install sharp');
    console.log('');
    console.log('alternatively, convert icon.svg manually using:');
    console.log('- https://svgtopng.com/');
    console.log('- or any image editor');
    console.log('');
    console.log('required sizes: 16x16, 48x48, 128x128');
    
    // still generate svg files for reference
    for (const size of sizes) {
      const svg = createSvg(size);
      const svgPath = path.join(projectRoot, `icon${size}.svg`);
      await fs.writeFile(svgPath, svg, 'utf8');
      console.log(`created ${svgPath} (convert to png manually)`);
    }
    
    return;
  }
  
  // generate png icons using sharp
  for (const size of sizes) {
    const svg = createSvg(size);
    const pngPath = path.join(projectRoot, `icon${size}.png`);
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(pngPath);
    
    console.log(`created ${pngPath}`);
  }
  
  console.log('');
  console.log('icons generated successfully');
}

generateIcons().catch(err => {
  console.error('failed to generate icons:', err.message);
  process.exit(1);
});
