// scripts/create-png-icons.js
// Creates minimal valid PNG icons for PWA/iOS without any external dependencies
// Uses raw PNG binary format with zlib compression

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(size) {
  const width = size;
  const height = size;
  
  // Create RGBA pixel data
  const rowBytes = width * 4 + 1; // +1 for filter byte
  const rawData = Buffer.alloc(rowBytes * height);
  
  const orange = [249, 115, 22, 255];   // #F97316
  const white = [255, 255, 255, 255];
  const transparent = [0, 0, 0, 0];
  
  // Radius for rounded corners
  const radius = Math.round(size * 0.195);
  
  // Simple "N" letter coordinates - define the letter shape
  const letterMargin = Math.round(size * 0.22);
  const letterWidth = Math.round(size * 0.12);
  
  const nLeft = letterMargin;
  const nRight = size - letterMargin;
  const nTop = letterMargin;
  const nBottom = size - letterMargin;
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter: None
    
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      
      // Check if pixel is inside rounded rect
      let inside = true;
      
      // Top-left corner
      if (x < radius && y < radius) {
        const dx = radius - x;
        const dy = radius - y;
        inside = (dx * dx + dy * dy) <= (radius * radius);
      }
      // Top-right corner
      if (x >= width - radius && y < radius) {
        const dx = x - (width - radius);
        const dy = radius - y;
        inside = (dx * dx + dy * dy) <= (radius * radius);
      }
      // Bottom-left corner
      if (x < radius && y >= height - radius) {
        const dx = radius - x;
        const dy = y - (height - radius);
        inside = (dx * dx + dy * dy) <= (radius * radius);
      }
      // Bottom-right corner
      if (x >= width - radius && y >= height - radius) {
        const dx = x - (width - radius);
        const dy = y - (height - radius);
        inside = (dx * dx + dy * dy) <= (radius * radius);
      }
      
      if (!inside) {
        rawData.set(transparent, pixelOffset);
        continue;
      }
      
      // Check if pixel is part of the "N" letter
      let isLetter = false;
      
      if (x >= nLeft && x < nLeft + letterWidth && y >= nTop && y <= nBottom) {
        // Left vertical bar of N
        isLetter = true;
      } else if (x >= nRight - letterWidth && x < nRight && y >= nTop && y <= nBottom) {
        // Right vertical bar of N
        isLetter = true;
      } else if (x >= nLeft && x < nRight && y >= nTop && y <= nBottom) {
        // Diagonal of N
        const progress = (x - nLeft) / (nRight - nLeft);
        const expectedY = nTop + progress * (nBottom - nTop);
        const diagWidth = letterWidth * 1.2;
        if (Math.abs(y - expectedY) < diagWidth / 2) {
          isLetter = true;
        }
      }
      
      rawData.set(isLetter ? white : orange, pixelOffset);
    }
  }
  
  // Compress pixel data
  const compressed = zlib.deflateSync(rawData);
  
  // Build PNG file
  const chunks = [];
  
  // PNG Signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  chunks.push(createChunk('IHDR', ihdr));
  
  // IDAT chunk
  chunks.push(createChunk('IDAT', compressed));
  
  // IEND chunk
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
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate icons
const publicDir = path.join(__dirname, '..', 'public');

[192, 512].forEach(size => {
  const png = createPNG(size);
  const filename = `icon-${size}x${size}.png`;
  fs.writeFileSync(path.join(publicDir, filename), png);
  console.log(`✅ Created ${filename} (${(png.length / 1024).toFixed(1)} KB)`);
});

console.log('\nDone! PNG icons created in public/');
