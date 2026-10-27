import { GoogleOneTapSignIn } from 'react-native-nitro-google-signin';
import { GOOGLE_CONFIG } from './constants';
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
 * Signs out from Google One Tap session
 */
export const signOutGoogle = async (): Promise<void> => {
  try {
    await GoogleOneTapSignIn.signOut();
  } catch (error) {
    console.warn('Google sign out error:', error);
  }
};
