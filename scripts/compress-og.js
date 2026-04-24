// scripts/compress-og.js
// Creates a lightweight OG image (under 300KB) using pure Node.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const WIDTH = 1200;
const HEIGHT = 630;

function createOGImage() {
  const rowBytes = WIDTH * 4 + 1;
  const rawData = Buffer.alloc(rowBytes * HEIGHT);
  
  // Colors
  const navy = [15, 23, 42];      // #0F172A
  const orange = [249, 115, 22];   // #F97316
  const white = [255, 255, 255];
  const orangeLight = [251, 146, 60]; // lighter orange
  
  for (let y = 0; y < HEIGHT; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter: None
    
    for (let x = 0; x < WIDTH; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      
      // Background: navy with subtle gradient
      const gradientFactor = y / HEIGHT;
      const r = Math.round(navy[0] + (20 * gradientFactor));
      const g = Math.round(navy[1] + (10 * gradientFactor));
      const b = Math.round(navy[2] + (30 * gradientFactor));
      
      let color = [r, g, b, 255];
      
      // Orange accent bar at top
      if (y < 6) {
        color = [...orange, 255];
      }
      
      // Orange circle decoration (top right)
      const cx1 = 1050, cy1 = 120, r1 = 180;
      const d1 = Math.sqrt((x - cx1) ** 2 + (y - cy1) ** 2);
      if (d1 < r1) {
        const alpha = Math.max(0, 1 - d1 / r1);
        color = [
          Math.round(color[0] + (orange[0] - color[0]) * alpha * 0.15),
          Math.round(color[1] + (orange[1] - color[1]) * alpha * 0.15),
          Math.round(color[2] + (orange[2] - color[2]) * alpha * 0.15),
          255
        ];
      }
      
      // Orange circle decoration (bottom left)
      const cx2 = 150, cy2 = 530, r2 = 200;
      const d2 = Math.sqrt((x - cx2) ** 2 + (y - cy2) ** 2);
      if (d2 < r2) {
        const alpha = Math.max(0, 1 - d2 / r2);
        color = [
          Math.round(color[0] + (orange[0] - color[0]) * alpha * 0.1),
          Math.round(color[1] + (orange[1] - color[1]) * alpha * 0.1),
          Math.round(color[2] + (orange[2] - color[2]) * alpha * 0.1),
          255
        ];
      }
      
      // Icon box (orange rounded square)
      const iconX = 80, iconY = 200, iconSize = 90, iconRadius = 22;
      const inIconX = x >= iconX && x < iconX + iconSize;
      const inIconY = y >= iconY && y < iconY + iconSize;
      if (inIconX && inIconY) {
        let inIcon = true;
        const lx = x - iconX, ly = y - iconY;
        // Rounded corners
        if (lx < iconRadius && ly < iconRadius) {
          inIcon = ((iconRadius - lx) ** 2 + (iconRadius - ly) ** 2) <= iconRadius ** 2;
        }
        if (lx >= iconSize - iconRadius && ly < iconRadius) {
          inIcon = ((lx - (iconSize - iconRadius)) ** 2 + (iconRadius - ly) ** 2) <= iconRadius ** 2;
        }
        if (lx < iconRadius && ly >= iconSize - iconRadius) {
          inIcon = ((iconRadius - lx) ** 2 + (ly - (iconSize - iconRadius)) ** 2) <= iconRadius ** 2;
        }
        if (lx >= iconSize - iconRadius && ly >= iconSize - iconRadius) {
          inIcon = ((lx - (iconSize - iconRadius)) ** 2 + (ly - (iconSize - iconRadius)) ** 2) <= iconRadius ** 2;
        }
        
        if (inIcon) {
          color = [...orange, 255];
          
          // "N" letter inside icon
          const nx = lx - 22, ny = ly - 18;
          const nw = 46, nh = 54;
          const barW = 10;
          if (nx >= 0 && nx < nw && ny >= 0 && ny < nh) {
            let isN = false;
            if (nx < barW) isN = true; // left bar
            if (nx >= nw - barW) isN = true; // right bar
            // diagonal
            const diag = (nx / nw) * nh;
            if (Math.abs(ny - diag) < barW * 0.7) isN = true;
            if (isN) color = [...white, 255];
          }
        }
      }
      
      // "NELAL EXPRESS" text (large) - at y=220, simple block letters
      const textY = 210;
      const textH = 50;
      const textX = 200;
      
      // Simple block rendering for "NELAL EXPRESS"
      const letters = 'NELAL EXPRESS';
      const charW = 38;
      const barWidth = 9;
      
      if (y >= textY && y < textY + textH && x >= textX) {
        const charIndex = Math.floor((x - textX) / charW);
        if (charIndex >= 0 && charIndex < letters.length) {
          const ch = letters[charIndex];
          const lx = (x - textX) - charIndex * charW;
          const ly = y - textY;
          const cw = charW - 6;
          
          if (lx < cw && isPixelInChar(ch, lx, ly, cw, textH, barWidth)) {
            color = [...white, 255];
          }
        }
      }
      
      // Subtitle: "Livraison Élite au Sénégal"
      const subY = 280;
      const subH = 16;
      if (y >= subY && y < subY + subH && x >= 200 && x < 680) {
        // Simple dashed line to represent subtitle
        const segment = (x - 200) % 8;
        if (segment < 6) {
          color = [
            Math.min(255, color[0] + 60),
            Math.min(255, color[1] + 60),
            Math.min(255, color[2] + 60),
            255
          ];
        }
      }
      
      // Tagline bar at bottom
      if (y >= 560 && y < 590 && x >= 80 && x < 500) {
        // "🇸🇳 Dakar · Banlieue · Intérieur" — represented as subtle text area
        const segment = (x - 80) % 6;
        if (segment < 4 && y >= 568 && y < 582) {
          color = [
            Math.min(255, color[0] + 30),
            Math.min(255, color[1] + 30),
            Math.min(255, color[2] + 30),
            255
          ];
        }
      }
      
      // Orange accent dots
      const dots = [[800, 400], [850, 420], [900, 400]];
      for (const [dx, dy] of dots) {
        const dd = Math.sqrt((x - dx) ** 2 + (y - dy) ** 2);
        if (dd < 4) {
          color = [...orange, 255];
        }
      }
      
      rawData.set(color, pixelOffset);
    }
  }
  
  return rawData;
}

function isPixelInChar(ch, x, y, w, h, bw) {
  const midY = h / 2;
  
  switch (ch) {
    case 'N':
      if (x < bw) return true; // left
      if (x >= w - bw) return true; // right
      { const diag = (x / w) * h; if (Math.abs(y - diag) < bw) return true; }
      return false;
    case 'E':
      if (x < bw) return true; // left
      if (y < bw) return true; // top
      if (y >= h - bw) return true; // bottom
      if (Math.abs(y - midY) < bw / 2 && x < w * 0.7) return true; // middle
      return false;
    case 'L':
      if (x < bw) return true;
      if (y >= h - bw) return true;
      return false;
    case 'A':
      if (x < bw && y > h * 0.3) return true; // left
      if (x >= w - bw && y > h * 0.3) return true; // right
      if (y < bw + h * 0.15) { // top triangle
        const center = w / 2;
        if (Math.abs(x - center) < bw) return true;
      }
      if (Math.abs(y - midY) < bw / 2) return true; // middle
      return false;
    case 'X':
      { const d1 = (x / w) * h; if (Math.abs(y - d1) < bw) return true; }
      { const d2 = ((w - x) / w) * h; if (Math.abs(y - d2) < bw) return true; }
      return false;
    case 'P':
      if (x < bw) return true;
      if (y < bw) return true;
      if (y < midY && x >= w - bw) return true;
      if (Math.abs(y - midY) < bw / 2) return true;
      return false;
    case 'R':
      if (x < bw) return true;
      if (y < bw) return true;
      if (y < midY && x >= w - bw) return true;
      if (Math.abs(y - midY) < bw / 2) return true;
      { const diag = midY + ((x - bw) / (w - bw)) * (h - midY); if (y > midY && Math.abs(y - diag) < bw) return true; }
      return false;
    case 'S':
      if (y < bw) return true;
      if (y >= h - bw) return true;
      if (Math.abs(y - midY) < bw / 2) return true;
      if (y < midY && x < bw) return true;
      if (y > midY && x >= w - bw) return true;
      return false;
    case ' ':
      return false;
    default:
      return false;
  }
}

function createPNGBuffer(rawData) {
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const chunks = [];
  
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(WIDTH, 0);
  ihdr.writeUInt32BE(HEIGHT, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  chunks.push(createChunk('IHDR', ihdr));
  chunks.push(createChunk('IDAT', compressed));
  chunks.push(createChunk('IEND', Buffer.alloc(0)));
  
  return Buffer.concat(chunks);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crc ^ buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) crc = (crc >>> 1) ^ 0xEDB88320;
      else crc = crc >>> 1;
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate
console.log('Generating OG image...');
const rawData = createOGImage();
const png = createPNGBuffer(rawData);
const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
fs.writeFileSync(outputPath, png);
console.log(`✅ Created og-image.png (${(png.length / 1024).toFixed(0)} KB)`);

if (png.length > 300 * 1024) {
  console.log('⚠️ Image still over 300KB, WhatsApp may not display it');
} else {
  console.log('✅ Under 300KB - WhatsApp/Facebook compatible!');
}
