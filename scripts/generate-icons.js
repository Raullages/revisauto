const { writeFileSync } = require("fs");
const { join } = require("path");
const zlib = require("zlib");

function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function createChunk(type, data) {
    const typeBuffer = Buffer.from(type, "ascii");
    const length = data.length;
    const crcData = Buffer.concat([typeBuffer, data]);
    
    const crc = crc32(crcData);
    
    const chunk = Buffer.alloc(12 + length);
    chunk.writeUInt32BE(length, 0);
    typeBuffer.copy(chunk, 4);
    data.copy(chunk, 8);
    chunk.writeUInt32BE(crc, 8 + length);
    return chunk;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // color type (RGB)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  // IDAT
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b);
    }
  }
  
  const compressed = zlib.deflateSync(Buffer.from(rawData));

  // IEND
  const result = Buffer.concat([
    signature,
    createChunk("IHDR", ihdr),
    createChunk("IDAT", compressed),
    createChunk("IEND", Buffer.alloc(0)),
  ]);

  return result;
}

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const iconsDir = join(__dirname, "..", "public", "icons");

writeFileSync(join(iconsDir, "icon-192x192.png"), createPNG(192, 192, 37, 99, 235));
writeFileSync(join(iconsDir, "icon-512x512.png"), createPNG(512, 512, 37, 99, 235));

console.log("Icons generated successfully!");
