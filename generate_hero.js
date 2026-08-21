const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths
const assetsDir = path.join(__dirname, 'assets');
const originalPath = path.join(assetsDir, 'welcome-hero-final.png');
const backupPath = path.join(assetsDir, 'welcome-hero-final-backup.png');
const outputPath = path.join(assetsDir, 'welcome-hero-final.png');

async function main() {
  console.log('Starting visual asset refinement...');

  // 1. Create a backup of the original if it doesn't exist
  if (!fs.existsSync(backupPath)) {
    console.log('Creating backup of original asset...');
    fs.copyFileSync(originalPath, backupPath);
  }

  // Dimensions of final asset
  const width = 1024;
  const height = 1536;

  // Center coordinates for camera lens (approximately cx=512, cy=580)
  const cx = 512;
  const cy = 580;

  // Floor light ring coordinates (approximately rx=200, ry=25, cy=1050)
  const floorY = 1050;

  // 2. Generate a highly detailed, premium visual SVG backdrop matching the Apple/Linear aesthetic.
  // This SVG includes:
  // - Glow 2: Massive, ultra-smooth atmospheric bloom (1200px diameter, 5% opacity)
  // - Glow 1: Rich, concentric cinematic radial glow (800px diameter, 12% opacity)
  // - Floor Ring: Wider horizontal oval representing the expanding ripple (500px width, 50px height)
  // - Sparse cross sparkles: Procedurally placed delicate sparkle stars surrounding the camera loop.
  const svgBackdrop = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Glow 2 Gradient: Huge Atmospheric Bloom -->
        <radialGradient id="glow2" cx="50%" cy="37.8%" r="60%">
          <stop offset="0%" stop-color="#16D6A3" stop-opacity="0.06" />
          <stop offset="60%" stop-color="#16D6A3" stop-opacity="0.02" />
          <stop offset="100%" stop-color="#16D6A3" stop-opacity="0" />
        </radialGradient>

        <!-- Glow 1 Gradient: Saturated Center Glow -->
        <radialGradient id="glow1" cx="50%" cy="37.8%" r="40%">
          <stop offset="0%" stop-color="#16D6A3" stop-opacity="0.14" />
          <stop offset="50%" stop-color="#16D6A3" stop-opacity="0.05" />
          <stop offset="100%" stop-color="#16D6A3" stop-opacity="0" />
        </radialGradient>

        <!-- Floor light ring gradient -->
        <radialGradient id="floorGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#16D6A3" stop-opacity="0.25" />
          <stop offset="50%" stop-color="#16D6A3" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#16D6A3" stop-opacity="0" />
        </radialGradient>

        <!-- Subtle sparkle star definition -->
        <g id="sparkle">
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#16D6A3" stroke-width="1.2" opacity="0.7" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#16D6A3" stroke-width="1.2" opacity="0.7" />
          <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" opacity="0.9" />
        </g>
      </defs>

      <!-- Black transparent-masked base canvas -->
      <rect width="100%" height="100%" fill="none" />

      <!-- Layer 1: Massive Atmospheric Bloom (Outer) -->
      <circle cx="${cx}" cy="${cy}" r="920" fill="url(#glow2)" />

      <!-- Layer 2: Core Concentric Glow (Inner) -->
      <circle cx="${cx}" cy="${cy}" r="500" fill="url(#glow1)" />

      <!-- Layer 3: Wide Floor Light Ripple/Ring -->
      <ellipse cx="${cx}" cy="${floorY}" rx="320" ry="40" fill="url(#floorGlow)" />
      <!-- Sharp core of floor light -->
      <ellipse cx="${cx}" cy="${floorY}" rx="140" ry="12" fill="#16D6A3" opacity="0.15" />

      <!-- Layer 4: Sparse, Elegant Sparkle Stars (Surrounding but not overlapping the lens core) -->
      <use href="#sparkle" x="220" y="420" transform="scale(0.8)" />
      <use href="#sparkle" x="180" y="700" transform="scale(0.6)" opacity="0.5" />
      <use href="#sparkle" x="800" y="460" transform="scale(0.9)" />
      <use href="#sparkle" x="850" y="720" transform="scale(0.7)" opacity="0.6" />
      <use href="#sparkle" x="310" y="960" transform="scale(0.5)" opacity="0.4" />
      <use href="#sparkle" x="720" y="940" transform="scale(0.6)" opacity="0.5" />
    </svg>
  `;

  try {
    console.log('Rendering SVG backdrop...');
    const backdropBuffer = await sharp(Buffer.from(svgBackdrop))
      .png()
      .toBuffer();

    console.log('Compositing original hero illustration over the refined backdrop...');
    // We composite the original transparent illustration over our gorgeous custom-rendered radial backdrop
    await sharp(backdropBuffer)
      .composite([{ input: backupPath, blend: 'over' }])
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(outputPath);

    console.log('Success! Refined cinematic visual asset created at:', outputPath);
  } catch (err) {
    console.error('Error generating refined asset:', err);
  }
}

main();
