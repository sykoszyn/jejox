// Genera los iconos PNG de la PWA (sin dependencias externas de imagen):
// un cuadrado con esquinas redondeadas en el color primario y una cruz
// blanca simple (simbolo medico universal, facil de reconocer).
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function roundedSquareMask(x, y, size, radius) {
  const cx = [radius, size - radius];
  const cy = [radius, size - radius];
  const nearCornerX = x < radius ? cx[0] : x > size - radius ? cx[1] : null;
  const nearCornerY = y < radius ? cy[0] : y > size - radius ? cy[1] : null;
  if (nearCornerX !== null && nearCornerY !== null) {
    const dx = x - nearCornerX;
    const dy = y - nearCornerY;
    return dx * dx + dy * dy <= radius * radius;
  }
  return true;
}

function crossMask(x, y, size) {
  const barThickness = size * 0.22;
  const armLength = size * 0.62;
  const cx = size / 2;
  const cy = size / 2;
  const inVerticalBar = Math.abs(x - cx) <= barThickness / 2 && Math.abs(y - cy) <= armLength / 2;
  const inHorizontalBar = Math.abs(y - cy) <= barThickness / 2 && Math.abs(x - cx) <= armLength / 2;
  return inVerticalBar || inHorizontalBar;
}

function generatePng(size, { maskable = false } = {}) {
  const bg = [198, 40, 40]; // #c62828
  const fg = [255, 255, 255];
  const radius = maskable ? 0 : Math.round(size * 0.2);
  // maskable icons need full-bleed background with safe-zone content
  const crossScale = maskable ? 0.5 : 1;

  const raw = Buffer.alloc((size * 4 + 1) * size);
  let offset = 0;
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0; // filter type per scanline
    for (let x = 0; x < size; x++) {
      const inSquare = maskable || roundedSquareMask(x, y, size, radius);
      let r = 0, g = 0, b = 0, a = 0;
      if (inSquare) {
        const relX = maskable ? (x - size * 0.25) / crossScale : x;
        const relY = maskable ? (y - size * 0.25) / crossScale : y;
        const effSize = maskable ? size * 0.5 : size;
        const isCross =
          relX >= 0 && relY >= 0 && relX < effSize && relY < effSize
            ? crossMask(relX, relY, effSize)
            : false;
        [r, g, b] = isCross ? fg : bg;
        a = 255;
      }
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public/icons', { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const size of sizes) {
  writeFileSync(`public/icons/icon-${size}.png`, generatePng(size));
}
writeFileSync('public/icons/maskable-512.png', generatePng(512, { maskable: true }));
writeFileSync('public/icons/apple-touch-icon.png', generatePng(180));

console.log('Iconos generados en public/icons');
