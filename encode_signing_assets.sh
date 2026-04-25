#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# encode_signing_assets.sh
#
# Run this on your Mac ONCE after exporting your certificate and provisioning
# profile from Xcode. It prints the base64 values to copy into Codemagic.
#
# Usage:
#   chmod +x encode_signing_assets.sh
#   ./encode_signing_assets.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  StudyOs — Codemagic Signing Asset Encoder                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ── Certificate (.p12) ──────────────────────────────────────────────────────
echo "Step 1: Find your .p12 certificate file"
echo "  (Export from Keychain Access → My Certificates → right-click → Export)"
echo ""
read -rp "Enter path to your .p12 file (e.g. ~/Desktop/certificate.p12): " P12_PATH
P12_PATH="${P12_PATH/#\~/$HOME}"

if [ ! -f "$P12_PATH" ]; then
  echo "❌ File not found: $P12_PATH"
  exit 1
fi

echo ""
echo "✅ CM_CERTIFICATE (copy this entire value into Codemagic):"
echo "───────────────────────────────────────────────────────────"
base64 -i "$P12_PATH"
echo ""
echo "───────────────────────────────────────────────────────────"

# ── Provisioning Profile (.mobileprovision) ─────────────────────────────────
echo ""
echo "Step 2: Find your .mobileprovision file"
echo "  (Xcode → Settings → Accounts → your team → Download Manual Profiles)"
echo "  Profiles are stored in:"
echo "  ~/Library/MobileDevice/Provisioning Profiles/"
echo ""

# List available profiles for convenience
PROFILES_DIR="$HOME/Library/MobileDevice/Provisioning Profiles"
if [ -d "$PROFILES_DIR" ]; then
  echo "Available provisioning profiles:"
  ls -1 "$PROFILES_DIR"/*.mobileprovision 2>/dev/null | while read -r f; do
    NAME=$(security cms -D -i "$f" 2>/dev/null | plutil -extract Name raw - 2>/dev/null || echo "unknown")
    echo "  $NAME → $f"
  done
  echo ""
fi

read -rp "Enter path to your .mobileprovision file: " PROFILE_PATH
PROFILE_PATH="${PROFILE_PATH/#\~/$HOME}"

if [ ! -f "$PROFILE_PATH" ]; then
  echo "❌ File not found: $PROFILE_PATH"
  exit 1
fi

echo ""
echo "✅ CM_PROVISIONING_PROFILE (copy this entire value into Codemagic):"
echo "───────────────────────────────────────────────────────────"
base64 -i "$PROFILE_PATH"
echo ""
echo "───────────────────────────────────────────────────────────"

# ── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Done! Add these 3 variables to Codemagic:                  ║"
echo "║                                                              ║"
echo "║  Group name: manual_code_signing                            ║"
echo "║                                                              ║"
echo "║  CM_CERTIFICATE          → the base64 output above          ║"
echo "║  CM_CERTIFICATE_PASSWORD → your .p12 export password        ║"
echo "║  CM_PROVISIONING_PROFILE → the base64 output above          ║"
echo "║                                                              ║"
echo "║  Codemagic UI path:                                         ║"
echo "║  App → Environment variables → Add group                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
