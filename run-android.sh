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

# Start Metro in the background if not already listening on port 8081.
# We manage Metro ourselves with --no-packager to avoid the RN CLI bug on
# Linux where the default --terminal xterm-kitty isn't a real binary: execa
# throws, the fallback runs Metro synchronously, and run-android never
# reaches the Gradle build.
if nc -z localhost 8081 2>/dev/null; then
  echo "==> Metro already running on :8081"
else
  echo "==> Starting Metro bundler in background…"
  npx react-native start > /tmp/metro.log 2>&1 &
  METRO_PID=$!
  echo "==> Waiting for Metro to accept connections on :8081…"
  until nc -z localhost 8081 2>/dev/null; do
    sleep 1
    # Bail if Metro died before it was ready
    if ! kill -0 "$METRO_PID" 2>/dev/null; then
      echo "ERROR: Metro (PID $METRO_PID) exited before becoming ready. Check /tmp/metro.log"
      exit 1
    fi
  done
  echo "==> Metro is ready (PID $METRO_PID, log: /tmp/metro.log)"
fi

echo "==> Building, installing, and starting app (Ctrl+C to stop)"
npx react-native run-android --no-packager
