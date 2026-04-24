# StudyOS: Build IPA and Sideload (Windows)

This guide is only for building an `.ipa` and installing it on your iPhone with Sideloadly.

## Before You Start

### On Windows
1. Install Node.js (LTS).
2. Install iTunes from Apple website (not Microsoft Store).
3. Install iCloud from Apple website (not Microsoft Store).
4. Install Sideloadly.

### On iPhone
1. Have your Apple ID ready.
2. Enable Developer Mode after first sideload prompt:
   - Settings -> Privacy & Security -> Developer Mode

## Step 1: Prepare Project

Open terminal in this project folder, then run:

```bash
npm install
npm run ios:setup
```

After any code change, run:

```bash
npm run ios:sync
```

## Step 2: Build the IPA

You need one of these:

1. **Mac + Xcode**
   - Open `ios/App/App.xcworkspace`
   - Set signing team
   - Archive and export `.ipa`

2. **Cloud Mac build service**
   - Upload/sync this project
   - Build iOS app
   - Download exported `.ipa`

## Step 3: Sideload with Sideloadly (Windows)

1. Connect iPhone to Windows with USB.
2. Trust computer on iPhone.
3. Open Sideloadly.
4. Drag your `.ipa` into Sideloadly.
5. Enter Apple ID and install.
6. On iPhone, trust the developer profile:
   - Settings -> General -> VPN & Device Management -> Trust

## Step 4: Re-sign Every 7 Days (Free Apple ID)

- Free Apple ID installs usually expire after 7 days.
- Reinstall/re-sign the same `.ipa` with Sideloadly.
- If Sideloadly auto-refresh is enabled and set correctly, refresh can be automatic.

## Quick Troubleshooting

- Device not detected: reinstall Apple iTunes/iCloud website versions and reconnect USB.
- App not opening after install: trust profile in iPhone settings and ensure Developer Mode is on.
- Install/sign error: try again with same Apple ID and same bundle/app.
