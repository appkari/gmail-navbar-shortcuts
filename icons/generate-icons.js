// Run with Node.js to regenerate PNG icons:
//   node icons/generate-icons.js
// Requires: npm install canvas

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size * 0.15; // corner radius

  // Background
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = '#1A73E8';
  ctx.fill();

  // Label/tag shape (white)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth   = size * 0.07;
  ctx.lineJoin    = 'round';
  ctx.lineCap     = 'round';

  const pad = size * 0.2;
  const cx  = size / 2;
  const cy  = size / 2;
  const hw  = size * 0.28;
  const hh  = size * 0.28;

  ctx.beginPath();
  // hexagon-like tag shape
  ctx.moveTo(cx - hw, cy - hh * 0.5);
  ctx.lineTo(cx,      cy - hh);
  ctx.lineTo(cx + hw, cy - hh * 0.5);
  ctx.lineTo(cx + hw, cy + hh * 0.5);
  ctx.lineTo(cx,      cy + hh);
  ctx.lineTo(cx - hw, cy + hh * 0.5);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.stroke();

  // dot
  ctx.beginPath();
  ctx.arc(cx - hw * 0.4, cy - hh * 0.15, size * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  return canvas.toBuffer('image/png');
}

[48, 96].forEach(function(size) {
  const buf = drawIcon(size);
  const out = path.join(__dirname, 'icon-' + size + '.png');
  fs.writeFileSync(out, buf);
  console.log('Written', out);
});
