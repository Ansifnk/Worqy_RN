import {
  GoogleOneTapSignIn,
  isNoSavedCredentialFoundResponse,
  isCancelledResponse,
  isSuccessResponse,
} from 'react-native-nitro-google-signin';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  type UserCredential,
} from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from '@react-native-firebase/firestore';
import { firebaseCollections, GOOGLE_CONFIG } from './constants';
import type { User } from '../context/AppContext';

let isConfigured = false;

/**
 * Ensures GoogleOneTapSignIn is configured with client IDs.
 */
export const configureGoogleSignIn = () => {
  if (isConfigured) return;
  try {
    GoogleOneTapSignIn.configure({
      webClientId: GOOGLE_CONFIG.webClientId,
      iosClientId: GOOGLE_CONFIG.iosClientId,
    });
    isConfigured = true;
  } catch (error) {
    console.warn('GoogleOneTapSignIn.configure error:', error);
  }
};

export interface GoogleAuthResult {
  success: boolean;
  cancelled?: boolean;
  user?: User;
  error?: string;
}

/**
 * Handles the complete Google authentication flow:
 * 1. Native Google Sign-In prompt
 * 2. ID token retrieval
 * 3. Firebase authentication with Google credential
 * 4. User profile persistence in Firestore
 */
export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    configureGoogleSignIn();

    // Check Play Services (no-op on iOS)
    try {
      await GoogleOneTapSignIn.checkPlayServices();
    } catch (playErr) {
      console.warn('Google Play Services check failed:', playErr);
    }

    // 1. Attempt silent / saved credential sign-in
    let response = await GoogleOneTapSignIn.signIn();

    // 2. If no saved credential, present the account picker dialog
    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.createAccount();
    }

    // 3. Fallback to explicit sign-in if needed
    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.presentExplicitSignIn();
    }

    // 4. Handle cancellation
    if (isCancelledResponse(response)) {
      return { success: false, cancelled: true };
    }

    // 5. Verify success and data
    if (!isSuccessResponse(response) || !response.data) {
      return { success: false, error: 'Sign in was not completed.' };
    }

    const { user: googleUser, idToken } = response.data;

    if (!idToken) {
      return {
        success: false,
        error: 'Failed to retrieve Google authentication token.',
      };
    }

    // 6. Sign in to Firebase with the Google ID Token
    const auth = getAuth();
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential: UserCredential = await signInWithCredential(auth, credential);
    const authUser = userCredential.user;

    // 7. Sync or create user record in Firestore
    let userData: User = {
      id: authUser.uid,
      name:
        authUser.displayName ||
        googleUser.name ||
        (authUser.email ? authUser.email.split('@')[0] : 'User'),
      email: authUser.email || googleUser.email || '',
    };

    try {
      const db = getFirestore();
      const userDocRef = doc(db, firebaseCollections.users, authUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        userData = {
          id: authUser.uid,
          name: data?.name || authUser.displayName || googleUser.name || 'User',
          email: data?.email || authUser.email || googleUser.email || '',
        };
      } else {
        await setDoc(userDocRef, userData);
      }
    } catch (firestoreError) {
      console.warn('Firestore user profile sync warning (proceeding with authUser):', firestoreError);
    }

    return {
      success: true,
      user: userData,
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);

    // Common cancellation errors across platforms
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === '12501' ||
      error?.message?.toLowerCase().includes('cancel')
    ) {
      return { success: false, cancelled: true };
    }

    let errorMsg = 'Google Sign-In failed. Please try again.';
    if (error?.code === 'auth/account-exists-with-different-credential') {
      errorMsg =
        'An account already exists with this email address using a different sign-in method.';
    } else if (error?.code === 'auth/invalid-credential') {
      errorMsg = 'Google authentication credential is invalid or has expired.';
    } else if (error?.message) {
      errorMsg = error.message;
    }

    return {
      success: false,
      error: errorMsg,
    };
  }
};

/**
 * Signs out from Google One Tap session
 */
export const signOutGoogle = async (): Promise<void> => {
  try {
    await GoogleOneTapSignIn.signOut();
  } catch (error) {
    console.warn('Google sign out error:', error);
  }
};
