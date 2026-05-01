// scripts/generate-icons.js
// Generates PNG icons from the SVG for iOS/Android PWA compatibility
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const publicDir = path.join(__dirname, '..', 'public');

// Create a simple PNG icon using raw binary data
// This creates an orange rounded square with a white "N"
function createPNG(size) {
  // We'll create an HTML file that uses canvas to generate the PNGs
  const html = `<!DOCTYPE html>
<html><body>
<canvas id="c" width="${size}" height="${size}"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const s = ${size};

// Background with rounded corners
const r = s * 0.195; // radius
ctx.beginPath();
ctx.moveTo(r, 0);
ctx.lineTo(s - r, 0);
ctx.quadraticCurveTo(s, 0, s, r);
ctx.lineTo(s, s - r);
ctx.quadraticCurveTo(s, s, s - r, s);
ctx.lineTo(r, s);
ctx.quadraticCurveTo(0, s, 0, s - r);
ctx.lineTo(0, r);
ctx.quadraticCurveTo(0, 0, r, 0);
ctx.closePath();
ctx.fillStyle = '#F97316';
ctx.fill();

// Letter "N"
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold ${Math.round(size * 0.55)}px sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('N', s/2, s/2);

// Output as data URL
document.title = canvas.toDataURL('image/png');
</script></body></html>`;
  return html;
}

// Since we can't easily generate PNGs in Node without dependencies,
// let's create a minimal valid PNG programmatically
function createMinimalPNG(size) {
  // Use SVG-based approach - convert SVG to a self-contained data
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#F97316"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-weight="bold" font-size="280" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">N</text>
</svg>`;
  return svg;
}

// Write SVG versions that will work as fallback
sizes.forEach(size => {
  const svg = createMinimalPNG(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(publicDir, filename), svg);
  console.log(`Created ${filename}`);
});

console.log('\n⚠️  For proper iOS support, you need PNG icons.');
console.log('Quick solution: Use https://realfavicongenerator.net/ to convert your icon.svg');
console.log('Or run this in a browser console and save the output:');
console.log('');

// Generate an HTML helper file
const helperHtml = `<!DOCTYPE html>
<html>
<head><title>Nelal Icon Generator</title></head>
<body style="font-family: sans-serif; padding: 40px; background: #f1f5f9;">
<h1>Nelal Express - Icon Generator</h1>
<p>Right-click each icon below and "Save image as..." to your <code>public/</code> folder.</p>
<div style="display: flex; gap: 20px; margin-top: 20px;">
${sizes.map(size => `
<div>
  <canvas id="icon${size}" width="${size}" height="${size}" style="border: 1px solid #ccc; border-radius: 8px;"></canvas>
  <p><strong>icon-${size}x${size}.png</strong></p>
  <a id="dl${size}" download="icon-${size}x${size}.png" style="display:inline-block; background: #F97316; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: bold; cursor: pointer;">
    Télécharger
  </a>
</div>
`).join('')}
</div>
<script>
${sizes.map(size => `
(function() {
  const canvas = document.getElementById('icon${size}');
  const ctx = canvas.getContext('2d');
  const s = ${size};
  const r = s * 0.195;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(s - r, 0);
  ctx.quadraticCurveTo(s, 0, s, r);
  ctx.lineTo(s, s - r);
  ctx.quadraticCurveTo(s, s, s - r, s);
  ctx.lineTo(r, s);
  ctx.quadraticCurveTo(0, s, 0, s - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = '#F97316';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold ' + Math.round(s * 0.55) + 'px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', s/2, s/2);
  
  const link = document.getElementById('dl${size}');
  link.href = canvas.toDataURL('image/png');
})();
`).join('\n')}
</script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'generate-icons.html'), helperHtml);
console.log('Created public/generate-icons.html');
console.log('👉 Open https://nelalexpress.com/generate-icons.html in your browser');
console.log('   then download the PNG icons and place them in public/');
