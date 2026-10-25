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
