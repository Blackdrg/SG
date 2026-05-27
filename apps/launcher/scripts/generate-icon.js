// Generate a 256x256 ICO file for Windows packaging
const fs = require('fs');
const path = require('path');

const createIco = () => {
  const size = 256;
  const widthBytes = Math.floor((size * 32 + 31) / 32) * 4;
  const pixelDataSize = widthBytes * size;
  const imageDataSize = 40 + pixelDataSize;
  
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: ICO
  header.writeUInt16LE(1, 4); // Number of images: 1

  const imageEntry = Buffer.alloc(16);
  imageEntry.writeUInt8(0, 0); // Width: 0 = 256
  imageEntry.writeUInt8(0, 1); // Height: 0 = 256
  imageEntry.writeUInt8(0, 2); // Color palette
  imageEntry.writeUInt8(0, 3); // Reserved
  imageEntry.writeUInt16LE(1, 4); // Color planes
  imageEntry.writeUInt16LE(32, 6); // Bits per pixel
  imageEntry.writeUInt32LE(imageDataSize, 8); // Size
  imageEntry.writeUInt32LE(22, 12); // Offset

  const bmpHeader = Buffer.alloc(40);
  bmpHeader.writeUInt32LE(40, 0); // Header size
  bmpHeader.writeInt32LE(size, 4); // Width
  bmpHeader.writeInt32LE(size * 2, 8); // Height (doubled for ICO)
  bmpHeader.writeUInt16LE(1, 12); // Planes
  bmpHeader.writeUInt16LE(32, 14); // Bits per pixel

  const pixels = Buffer.alloc(pixelDataSize);
  let offset = 0;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - 128;
      const dy = y - 128;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 100) {
        // SpiceGarden green (#10b981) with gradient
        const intensity = 1 - Math.min(1, dist / 100);
        const r = Math.floor(16 + intensity * 140);
        const g = Math.floor(185 + intensity * 40);
        const b = Math.floor(129);
        const a = 255;
        pixels[offset++] = b;
        pixels[offset++] = g;
        pixels[offset++] = r;
        pixels[offset++] = a;
      } else {
        pixels[offset++] = 15;
        pixels[offset++] = 23;
        pixels[offset++] = 39;
        pixels[offset++] = 255;
      }
    }
  }

  const icon = Buffer.concat([header, imageEntry, bmpHeader, pixels]);
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'icon.ico'), icon);
  console.log('Generated 256x256 icon.ico');
};

createIco();