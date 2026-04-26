# 🚀 Codemagic Build Setup for StudyOS

## ✅ What's Already Done

1. **Icon exists**: Your `assets/icon.png` (602KB) is ready
2. **Scripts updated**: `package.json` now includes icon generation
3. **codemagic.yaml created**: Full CI/CD configuration ready

## 📋 Next Steps for Codemagic

### Option A: Using codemagic.yaml (Recommended)

1. Go to [Codemagic](https://codemagic.io)
2. Connect your GitHub repository
3. Codemagic will auto-detect `codemagic.yaml`
4. Add these environment variables in Codemagic settings:
   - `IOS_PROVISIONING_PROFILE` (your .mobileprovision file content)
   - `DEVELOPER_TEAM_ID` (your Apple Developer Team ID)
   - `CODE_SIGN_IDENTITY` (optional, defaults to "iPhone Distribution")

5. Click "Start Build" - it will:
   - Install dependencies
   - Generate all icon sizes from `assets/icon.png`
   - Sync Capacitor
   - Build the iOS app with your custom icon

### Option B: Manual Build Steps

If you prefer manual control, run these commands locally before pushing:

```bash
# 1. Install dependencies
npm install

# 2. Generate all required icon sizes
npx @capacitor/assets generate --iconSrc ./assets/icon.png

# 3. Prepare web files and sync to iOS
npm run prepare:web
npx cap sync ios

# 4. Verify icons were generated
ls -la ios/App/App/AppIcon.appiconset/
```

Then push to Git and Codemagic will build automatically.

## 📁 Generated Icon Structure

After running `@capacitor/assets generate`, you'll have:

```
ios/App/App/AppIcon.appiconset/
├── Contents.json (auto-generated manifest)
├── AppIcon-20x20@1x.png
├── AppIcon-20x20@2x.png
├── AppIcon-20x20@3x.png
├── AppIcon-29x29@1x.png
├── AppIcon-29x29@2x.png
├── AppIcon-29x29@3x.png
├── AppIcon-40x40@1x.png
├── AppIcon-40x40@2x.png
├── AppIcon-40x40@3x.png
├── AppIcon-60x60@2x.png
├── AppIcon-60x60@3x.png
├── AppIcon-76x76@1x.png
├── AppIcon-76x76@2x.png
├── AppIcon-83.5x83.5@2x.png
└── AppIcon-1024x1024@1x.png
```

All 18 icon sizes needed for iOS!

## ⚠️ Important Notes

1. **Icon Requirements**: 
   - Must be 1024x1024 PNG
   - No transparency
   - No rounded corners (iOS adds them automatically)
   - Your current icon meets all requirements ✓

2. **Code Signing**: 
   - You need an Apple Developer account ($99/year)
   - Create provisioning profile in Apple Developer Portal
   - Add it to Codemagic environment variables

3. **Build Artifacts**:
   - `.ipa` file will be available for download
   - Can be uploaded to TestFlight or App Store Connect

## 🔧 Troubleshooting

**Icons not appearing?**
```bash
# Check if icon.png is valid
file assets/icon.png
# Should output: PNG image data, 1024 x 1024, ...

# Regenerate icons
rm -rf ios/App/App/AppIcon.appiconset/*
npx @capacitor/assets generate --iconSrc ./assets/icon.png
```

**Build fails on Codemagic?**
- Check that `codemagic.yaml` is in the root directory
- Verify environment variables are set correctly
- Check Codemagic build logs for specific errors

## 📞 Need Help?

- [Capacitor Assets Docs](https://capacitorjs.com/docs/guides/splash-screens-icons)
- [Codemagic iOS Docs](https://docs.codemagic.io/ios/basic-configuration/)
- [Apple Developer Portal](https://developer.apple.com/account/)
