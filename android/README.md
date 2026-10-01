# Android self-test build

This is a small Android WebView shell for the live TimeBook site. It does not
replace the HTML/CSS or require publishing to an app store.

The locally built APK is at `app/build/outputs/apk/release/app-release.apk`. A copy
is published at `https://lgy8687.github.io/timebook/downloads/timebook-android-test.apk`
for installation on a phone. Android may ask you to allow installation from
that source. To rebuild, open this `android` directory in Android Studio and
run the `assembleRelease` task. This self-test APK uses the local debug signing
key but is not a debuggable build. Use the same machine for later builds so its
debug signing key stays the same and updates can retain app data.

The app requires internet access. Its WebView storage is separate from the
phone browser's storage: existing browser records are **not** copied into the
app automatically. The website's My > More settings now has Export backup and
Import backup. Export on the original phone, transfer the JSON file yourself,
then import it in the app on the other phone. The backup is never uploaded by
TimeBook. Do not delete the original browser copy until the imported records
have been checked. The app still loads the live website and needs internet.
