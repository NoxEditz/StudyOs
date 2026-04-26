#!/usr/bin/env node

const capacitorAssets = require('@capacitor/assets');
const generate = capacitorAssets.generate || capacitorAssets.default;

async function main() {
  try {
    await generate({
      iconSrc: './assets/icon.png',
      platform: 'ios',
      log: true
    });
    console.log('Icons generated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main();
