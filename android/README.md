# Android self-test build

This is a small Android WebView shell for the live TimeBook site. It does not
replace the HTML/CSS or require publishing to an app store.

The locally built APK is at `app/build/outputs/apk/debug/app-debug.apk`. Install
it on an Android phone; Android may ask you to allow installation from that
source. To rebuild, open this `android` directory in Android Studio and run
the `assembleDebug` task. Use the same machine for later builds so its debug
signing key stays the same and updates can retain app data.

The app requires internet access. Its WebView storage is separate from the
phone browser's storage: existing browser records are **not** copied into the
app. Do not delete the browser copy while testing. Treat this as a separate
test space until data export/import is added.
