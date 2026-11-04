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

// Patch react-native-razorpay iOS RazorpayCheckout.mm
const razorpayTarget = path.join(
  __dirname,
  '../node_modules/react-native-razorpay/ios/RazorpayCheckout.mm'
);

if (fs.existsSync(razorpayTarget)) {
  let content = fs.readFileSync(razorpayTarget, 'utf8');
  let modified = false;

  // 1. Retain razorpay instance on RNRazorpayCheckout so ARC doesn't deallocate it mid-checkout
  if (!content.includes('@property (nonatomic, strong) Razorpay *razorpay;')) {
    content = content.replace(
      '@interface RNRazorpayCheckout () <RazorpayPaymentCompletionProtocolWithData,\nExternalWalletSelectionProtocol>\n\n@end',
      '@interface RNRazorpayCheckout () <RazorpayPaymentCompletionProtocolWithData,\nExternalWalletSelectionProtocol>\n@property (nonatomic, strong) Razorpay *razorpay;\n@end'
    );
    modified = true;
  }

  // 2. Fix dispatch_sync deadlock, deallocation, and safe presenter resolution in open:
  const oldOpenRegex = /RCT_EXPORT_METHOD\(open\s*:\s*\(NSDictionary \*\)options\)\s*\{[\s\S]*?\n\}/;
  const newOpenMethod = `RCT_EXPORT_METHOD(open : (NSDictionary *)options) {

    NSString *keyID = (NSString *)[options objectForKey:@"key"];
    if (!keyID || [keyID length] == 0) {
        [RazorpayEventEmitter onPaymentError:0 description:@"Razorpay Key ID is missing" andData:nil];
        return;
    }

    void (^openBlock)(void) = ^{
        self.razorpay = [Razorpay initWithKey:keyID
                               andDelegateWithData:self];
        [self.razorpay setExternalWalletSelectionDelegate:self];
        NSMutableDictionary * tempOptions = [[NSMutableDictionary alloc] initWithDictionary:options];
        tempOptions[@"integration"] = @"react_native";
        tempOptions[@"FRAMEWORK"] = @"react_native";

        //get root view to present razorpay vc
        UIWindow *window = nil;
        id<UIApplicationDelegate> app = [[UIApplication sharedApplication] delegate];
        if ([app respondsToSelector:@selector(window)] && app.window) {
            window = app.window;
        }
        if (!window) {
            for (UIScene *scene in [UIApplication sharedApplication].connectedScenes) {
                if (scene.activationState == UISceneActivationStateForegroundActive && [scene isKindOfClass:[UIWindowScene class]]) {
                    UIWindowScene *windowScene = (UIWindowScene *)scene;
                    for (UIWindow *w in windowScene.windows) {
                        if (w.isKeyWindow) {
                            window = w;
                            break;
                        }
                    }
                    if (window) break;
                    if (windowScene.windows.count > 0) {
                        window = windowScene.windows.firstObject;
                        break;
                    }
                }
            }
        }
        if (!window) {
            for (UIScene *scene in [UIApplication sharedApplication].connectedScenes) {
                if ([scene isKindOfClass:[UIWindowScene class]]) {
                    UIWindowScene *windowScene = (UIWindowScene *)scene;
                    if (windowScene.windows.count > 0) {
                        window = windowScene.windows.firstObject;
                        break;
                    }
                }
            }
        }
        if (!window) {
            #pragma clang diagnostic push
            #pragma clang diagnostic ignored "-Wdeprecated-declarations"
            window = [UIApplication sharedApplication].keyWindow ?: [UIApplication sharedApplication].windows.firstObject;
            #pragma clang diagnostic pop
        }

        UIViewController *rootViewController = window.rootViewController;
        UIViewController *topController = rootViewController;
        while (topController.presentedViewController && !topController.presentedViewController.isBeingDismissed) {
            topController = topController.presentedViewController;
        }

        UIViewController *displayVC = topController ?: rootViewController;
        if (!displayVC) {
            NSLog(@"[RazorpayCheckout] Error: No valid UIViewController found to present checkout");
            [RazorpayEventEmitter onPaymentError:0 description:@"Could not find UIViewController to present Razorpay checkout" andData:nil];
            self.razorpay = nil;
            return;
        }

        [self.razorpay open:tempOptions displayController:displayVC];
    };

    if ([NSThread isMainThread]) {
        openBlock();
    } else {
        dispatch_async(dispatch_get_main_queue(), openBlock);
    }
}`;

  if (oldOpenRegex.test(content) && content.includes('dispatch_sync(dispatch_get_main_queue()')) {
    content = content.replace(oldOpenRegex, newOpenMethod);
    modified = true;
  }

  // 3. Clear self.razorpay on callback completion
  if (content.includes('[RazorpayEventEmitter onPaymentSuccess:payment_id andData:response];') &&
      !content.includes('self.razorpay = nil;\n    [RazorpayEventEmitter onPaymentSuccess:')) {
    content = content.replace(
      '[RazorpayEventEmitter onPaymentSuccess:payment_id andData:response];',
      'self.razorpay = nil;\n    [RazorpayEventEmitter onPaymentSuccess:payment_id andData:response];'
    );
    content = content.replace(
      '[RazorpayEventEmitter onPaymentError:code description:str andData:response];',
      'self.razorpay = nil;\n    [RazorpayEventEmitter onPaymentError:code description:str andData:response];'
    );
    content = content.replace(
      '[RazorpayEventEmitter onExternalWalletSelected:walletName\n                                           andData:paymentData];',
      'self.razorpay = nil;\n    [RazorpayEventEmitter onExternalWalletSelected:walletName\n                                           andData:paymentData];'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(razorpayTarget, content, 'utf8');
    console.log('[patch] Patched RazorpayCheckout.mm for iOS main thread safety, strong retention, and modal presentation');
  }
}


