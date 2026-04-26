#!/usr/bin/env node

const { generate } = require('@capacitor/assets');

async function main() {
  try {
    await generate({
      iconSrc: './assets/icon.png',
      log: true
    });
    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main();
