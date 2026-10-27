import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { setAuthToken } from './http';
import type { User } from '../context/AppContext';

// Create a named storage instance as requested
const storage = createAsyncStorage('appDB');

const TOKEN_KEY = '@worqy_auth_token';
const USER_KEY = '@worqy_auth_user';

/**
 * Saves auth token and user profile into persistent storage
 * and updates in-memory HTTP client token.
 */
export const saveAuthSession = async (token: string, user: User): Promise<void> => {
  try {
    setAuthToken(token);
    await Promise.all([
      storage.setItem(TOKEN_KEY, token),
      storage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
  } catch (error) {
    console.error('Failed to save auth session to storage:', error);
    throw error;
  }
};

/**
 * Loads saved auth session from storage on app launch.
 * Automatically synchronizes the HTTP client authorization token.
 */
export const loadAuthSession = async (): Promise<{ token: string | null; user: User | null }> => {
  try {
    const [token, userRaw] = await Promise.all([
      storage.getItem(TOKEN_KEY),
      storage.getItem(USER_KEY),
    ]);

    let user: User | null = null;
    if (userRaw) {
      try {
        user = JSON.parse(userRaw);
      } catch (e) {
        console.warn('Failed to parse stored user JSON:', e);
      }
    }

    if (token) {
      setAuthToken(token);
    }

    return { token, user };
  } catch (error) {
    console.error('Failed to load auth session from storage:', error);
    return { token: null, user: null };
  }
};

/**
 * Clears stored auth session from storage and resets HTTP client token.
 */
export const clearAuthSession = async (): Promise<void> => {
  try {
    setAuthToken(null);
    await Promise.all([
      storage.removeItem(TOKEN_KEY),
      storage.removeItem(USER_KEY),
    ]);
  } catch (error) {
    console.error('Failed to clear auth session from storage:', error);
  }
};

export default storage;
