#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ANDROID_SDK="${ANDROID_HOME:-$HOME/Android/Sdk}"
ADB="$ANDROID_SDK/platform-tools/adb"
EMULATOR="$ANDROID_SDK/emulator/emulator"

AVD="${1:-Pixel-8a-API-35-x86}"   # pass an AVD name as $1 to override

# Write local.properties so Gradle finds the SDK
echo "sdk.dir=$ANDROID_SDK" > android/local.properties

# Boot the emulator if no device is currently online
if ! "$ADB" devices | grep -q "emulator.*device"; then
  echo "==> Starting emulator: $AVD"
  nohup "$EMULATOR" -avd "$AVD" -no-snapshot-save -gpu host > /tmp/emulator-"$AVD".log 2>&1 &

  echo "==> Waiting for emulator to come online…"
  "$ADB" wait-for-device

  echo "==> Waiting for Android to finish booting…"
  until "$ADB" shell getprop sys.boot_completed 2>/dev/null | grep -q "^1$"; do
    sleep 2
  done

  "$ADB" shell input keyevent 82   # unlock screen
  sleep 1
fi

echo "==> Installing JS deps"
npm install --legacy-peer-deps

# run-android starts Metro itself and keeps it running in the foreground.
# Do not pre-start Metro — it would get orphaned and block port 8081.
echo "==> Building, installing, and starting Metro (Ctrl+C to stop)"
npx react-native run-android
