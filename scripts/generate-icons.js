#!/usr/bin/env node

/**
 * Generate iOS app icons from assets/icon.png
 * Uses @capacitor/assets package
 */

const path = require('path');
const fs = require('fs');

async function main() {
  // Dynamically import @capacitor/assets to handle ES module
  const capacitorAssets = await import('@capacitor/assets');
  
  // Handle both named export and default export patterns
  const generate = capacitorAssets.generate || capacitorAssets.default;
  
  if (typeof generate !== 'function') {
    console.error('Error: Could not find generate function in @capacitor/assets');
    console.error('Available exports:', Object.keys(capacitorAssets));
    process.exit(1);
  }

  const projectRoot = path.resolve(__dirname, '..');
  const iconSource = path.join(projectRoot, 'assets', 'icon.png');
  const iosDir = path.join(projectRoot, 'ios', 'App', 'App');

  // Verify icon exists
  if (!fs.existsSync(iconSource)) {
    console.error(`Error: Icon not found at ${iconSource}`);
    process.exit(1);
  }

  console.log(`Generating icons from: ${iconSource}`);
  console.log(`Output directory: ${iosDir}`);

  try {
    await generate({
      iconSrc: iconSource,
      platform: 'ios',
      projectDir: iosDir
    });
    
    console.log('✓ Icons generated successfully!');
    
    // Verify output
    const appIconSet = path.join(iosDir, 'AppIcon.appiconset');
    if (fs.existsSync(appIconSet)) {
      const files = fs.readdirSync(appIconSet);
      console.log(`✓ Generated ${files.length} files in AppIcon.appiconset`);
    }
  } catch (error) {
    console.error('Error generating icons:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
