#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

resolve_android_sdk() {
  if [[ -n "${ANDROID_HOME:-}" ]]; then
    printf '%s\n' "$ANDROID_HOME"
  elif [[ -n "${ANDROID_SDK_ROOT:-}" ]]; then
    printf '%s\n' "$ANDROID_SDK_ROOT"
  elif [[ "$(uname -s)" == "Darwin" ]]; then
    printf '%s\n' "$HOME/Library/Android/sdk"
  else
    printf '%s\n' "$HOME/Android/Sdk"
  fi
}

port_in_use() {
  nc -z localhost "$1" 2>/dev/null
}

kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
  fi
}

ANDROID_SDK="$(resolve_android_sdk)"
ADB="$ANDROID_SDK/platform-tools/adb"
EMULATOR="$ANDROID_SDK/emulator/emulator"

for tool in "$ADB" "$EMULATOR"; do
  if [[ ! -x "$tool" ]]; then
    echo "ERROR: Required tool not found: $tool"
    echo "Set ANDROID_HOME or install the Android SDK."
    exit 1
  fi
done

AVD="${1:-Pixel-8a-API-35-x86}"   # pass an AVD name as $1 to override

if [[ "$(uname -s)" == "Darwin" ]]; then
  EMULATOR_GPU=(-gpu auto)
else
  EMULATOR_GPU=(-gpu host)
fi

# Write local.properties so Gradle finds the SDK
echo "sdk.dir=$ANDROID_SDK" > android/local.properties

# Boot the emulator if no device is currently online
if ! "$ADB" devices | grep -q "emulator.*device"; then
  echo "==> Starting emulator: $AVD"
  nohup "$EMULATOR" -avd "$AVD" -no-snapshot-save "${EMULATOR_GPU[@]}" > /tmp/emulator-"$AVD".log 2>&1 &

  echo "==> Waiting for emulator to come online…"
  "$ADB" wait-for-device

  echo "==> Waiting for Android to finish booting…"
  until "$ADB" shell getprop sys.boot_completed 2>/dev/null | grep -q "^1$"; do
    sleep 2
  done

  echo "==> Waiting for package manager service…"
  until "$ADB" shell pm list packages > /dev/null 2>&1; do
    sleep 2
  done

  "$ADB" shell input keyevent 82   # unlock screen
  sleep 1
fi

echo "==> Installing JS deps"
npm install --legacy-peer-deps

# Always restart Metro with a clean cache to prevent stale JS bundles.
# We manage Metro ourselves with --no-packager to avoid the RN CLI bug on
# Linux where the default --terminal xterm-kitty isn't a real binary: execa
# throws, the fallback runs Metro synchronously, and run-android never
# reaches the Gradle build.
if port_in_use 8081; then
  echo "==> Killing existing Metro on :8081…"
  kill_port 8081
  sleep 1
fi

echo "==> Starting Metro bundler (--reset-cache)…"
npx react-native start --reset-cache > /tmp/metro.log 2>&1 &
METRO_PID=$!
echo "==> Waiting for Metro to accept connections on :8081…"
until port_in_use 8081; do
  sleep 1
  if ! kill -0 "$METRO_PID" 2>/dev/null; then
    echo "ERROR: Metro (PID $METRO_PID) exited before becoming ready. Check /tmp/metro.log"
    exit 1
  fi
done
echo "==> Metro is ready (PID $METRO_PID, log: /tmp/metro.log)"

echo "==> Checking emulator storage…"
AVAIL_KB=$("$ADB" shell df /data 2>/dev/null | awk 'NR==2 {print $4}')
if [[ -n "$AVAIL_KB" && "$AVAIL_KB" -lt 524288 ]]; then
  echo "==> Low storage (${AVAIL_KB}KB free) — clearing caches…"
  "$ADB" shell pm clear com.android.providers.downloads > /dev/null 2>&1 || true
  "$ADB" shell pm clear com.google.android.gms > /dev/null 2>&1 || true
fi

echo "==> Building, installing, and starting app (Ctrl+C to stop)"
npx react-native run-android --no-packager
