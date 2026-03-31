# Building APK for Android

Your app can be built as a native APK in two ways:

## Option 1: Online APK Builder (Easiest - 5 minutes)

Use an online service without installing anything:

### Steps:
1. Go to: **https://www.uppercut.app/** or **https://www.appsgeyser.com/**
2. Enter your web app URL:
   ```
   https://utilityinfoforf-creator.github.io/f3-16utilityinfo/pages/main/index.html
   ```
3. Set app name: `Utility Dashboard`
4. Set icon: Use the lightning emoji (⚡) or upload an image
5. Download the APK file
6. Transfer to your Android phone
7. Tap the APK file → Install

**Done! You have an APK.** 🎉

---

## Option 2: Build with Capacitor (Professional)

For a properly signed, production-ready APK with Android Studio:

### Prerequisites:
- Node.js installed: https://nodejs.org/
- Android Studio: https://developer.android.com/studio
- 30 minutes of setup time

### Build Steps:

```bash
# 1. Install dependencies
npm install

# 2. Build Android project
npm run android

# 3. Open in Android Studio
# Android Studio will open automatically
# Or: File → Open → select 'android/' folder

# 4. Build APK in Android Studio
# Build → Build Bundle(s) / APK(s) → Build APK(s)

# 5. Locate your APK
# android/app/release/app-release.apk
```

### Signing the APK (For Release):
- Use Android Studio's "Build → Generate Signed Bundle / APK"
- Create a keystore file
- Sign with your credentials
- APK is ready for distribution

---

## Recommended: Use Option 1 (Online Builder)

**Why?**
- ✅ No installation needed
- ✅ 5 minutes to get APK
- ✅ Works perfectly for your dashboard
- ✅ Can send to others easily

**Go to:** https://www.uppercut.app/ → Follow the steps above

---

## After You Have the APK:

### Share with Users:
- Email the APK file
- Or host on Google Play (requires signing up for Play Store)
- Or use sites like: apkmonk.com, apkpure.com

### Install on Phone:
1. Download APK to phone
2. Tap to install
3. Android will ask for permissions
4. Tap "Install"
5. Done! App appears on home screen

---

## App Features in APK:
- Full utility dashboard
- Dark mode toggle
- English & Bengali support
- Payment history, usage trends
- All features from web version
- Works online (requires internet)

---

**Need help? Start with Option 1 (online builder) - it's the fastest!** 🚀
