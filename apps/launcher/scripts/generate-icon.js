// Simple icon generation - creates a minimal valid ICO file
const fs = require('fs');
const path = require('path');

// This creates a 16x16 ICO file (minimal valid format)
// For production, replace with proper multi-resolution ICO

const createSimpleICO = () => {
  // ICO header
  const header = Buffer.from([
    0x00, 0x00, // Reserved
    0x01, 0x00, // Type: ICO
    0x01, 0x00  // Number of images: 1
  ]);

  // Image entry
  const imageEntry = Buffer.from([
    0x10, // Width: 16
    0x00, // Height: 0 (means 256)
    0x00, // Color palette
    0x00, // Reserved
    0x01, 0x00, // Color planes
    0x20, 0x00, // Bits per pixel: 32
  ]);

  // Calculate image data size (16*16*4 + 40 header = 1344 bytes)
  const imageDataSize = 16 * 16 * 4 + 40;
  const imageSize = Buffer.alloc(4);
  imageSize.writeUInt32LE(imageDataSize, 0);

  // Offset (after header + entry = 22 bytes)
  const offset = Buffer.from([
    0x16, 0x00, 0x00, 0x00 // Offset: 22
  ]);

  // BMP info header (40 bytes)
  const bmpHeader = Buffer.alloc(40);
  bmpHeader.writeUInt32LE(40, 0); // Header size
  bmpHeader.writeInt32LE(16, 4); // Width
  bmpHeader.writeInt32LE(32, 8); // Height (doubled)
  bmpHeader.writeUInt16LE(1, 12); // Planes
  bmpHeader.writeUInt16LE(32, 14); // Bits per pixel

  // Pixel data - green gradient pattern
  const pixels = [];
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const dx = x - 8;
      const dy = y - 8;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 7) {
        // Green color (#10b981)
        const intensity = 1 - dist / 7;
        const r = Math.floor(16 + intensity * 140);
        const g = Math.floor(185 + intensity * 40);
        const b = Math.floor(129 + intensity * 20);
        const a = 255;
        pixels.push(b, g, r, a);
      } else {
        pixels.push(0, 0, 0, 0);
      }
    }
  }

  const pixelData = Buffer.from(pixels);
  
  const icon = Buffer.concat([
    header,
    imageEntry,
    imageSize,
    offset,
    bmpHeader,
    pixelData
  ]);

  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'icon.ico'), icon);
  console.log('Generated placeholder icon.ico (16x16)');
};

createSimpleICO();