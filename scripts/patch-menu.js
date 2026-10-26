const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '../node_modules/@react-native-menu/menu/ios/MenuViewManager.mm'
);

if (fs.existsSync(target)) {
  let content = fs.readFileSync(target, 'utf8');
  if (content.includes('#import "RCTBridge.h"')) {
    content = content.replace('#import "RCTBridge.h"', '#import <React/RCTBridge.h>');
    fs.writeFileSync(target, content, 'utf8');
    console.log('[patch] Patched MenuViewManager.mm to use <React/RCTBridge.h>');
  }
}

const nitroTargets = [
  path.join(__dirname, '../node_modules/react-native-nitro-google-signin/android/src/main/java/com/nitrogooglesignin/GoogleSignInButtonViewManager.kt'),
  path.join(__dirname, '../node_modules/react-native-nitro-google-signin/nitrogen/generated/android/kotlin/com/margelo/nitro/nitrogooglesignin/views/HybridGoogleSignInButtonManager.kt'),
];

nitroTargets.forEach((file) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('if (hybridView is RecyclableView)')) {
      content = content.replace(
        'if (hybridView is RecyclableView)',
        'val candidate = hybridView as Any\n    if (candidate is RecyclableView)'
      );
      content = content.replace(
        'hybridView.prepareForRecycle()',
        'candidate.prepareForRecycle()'
      );
      fs.writeFileSync(file, content, 'utf8');
      console.log(`[patch] Patched ${path.basename(file)} for Kotlin compatibility`);
    }
  }
});

