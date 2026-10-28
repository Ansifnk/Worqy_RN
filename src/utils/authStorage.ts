import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { setAuthToken, setRefreshToken } from './http';
import type { User } from '../context/AppContext';

// Create a named storage instance as requested
const storage = createAsyncStorage('appDB');

const TOKEN_KEY = '@worqy_auth_token';
const REFRESH_TOKEN_KEY = '@worqy_refresh_token';
const USER_KEY = '@worqy_auth_user';

/**
 * Saves auth token, optional refresh token, and user profile into persistent storage
 * and updates in-memory HTTP client tokens.
 */
export const saveAuthSession = async (
  token: string,
  user: User,
  refreshToken?: string | null,
): Promise<void> => {
  try {
    setAuthToken(token);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }

    const promises: Promise<any>[] = [
      storage.setItem(TOKEN_KEY, token),
      storage.setItem(USER_KEY, JSON.stringify(user)),
    ];

    if (refreshToken !== undefined && refreshToken !== null) {
      promises.push(storage.setItem(REFRESH_TOKEN_KEY, refreshToken));
    }

    await Promise.all(promises);
  } catch (error) {
    console.error('Failed to save auth session to storage:', error);
    throw error;
  }
};

/**
 * Saves only tokens to storage and updates in-memory HTTP client tokens.
 */
export const saveTokens = async (
  accessToken: string,
  refreshToken?: string | null,
): Promise<void> => {
  try {
    setAuthToken(accessToken);
    const promises: Promise<any>[] = [storage.setItem(TOKEN_KEY, accessToken)];

    if (refreshToken) {
      setRefreshToken(refreshToken);
      promises.push(storage.setItem(REFRESH_TOKEN_KEY, refreshToken));
    }

    await Promise.all(promises);
  } catch (error) {
    console.error('Failed to update auth tokens in storage:', error);
  }
};

/**
 * Loads saved auth session from storage on app launch.
 * Automatically synchronizes the HTTP client authorization tokens.
 */
export const loadAuthSession = async (): Promise<{
  token: string | null;
  refreshToken: string | null;
  user: User | null;
}> => {
  try {
    const [token, storedRefreshToken, userRaw] = await Promise.all([
      storage.getItem(TOKEN_KEY),
      storage.getItem(REFRESH_TOKEN_KEY),
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
    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }

    return { token, refreshToken: storedRefreshToken, user };
  } catch (error) {
    console.error('Failed to load auth session from storage:', error);
    return { token: null, refreshToken: null, user: null };
  }
};

/**
 * Clears stored auth session from storage and resets HTTP client tokens.
 */
export const clearAuthSession = async (): Promise<void> => {
  try {
    setAuthToken(null);
    setRefreshToken(null);
    await Promise.all([
      storage.removeItem(TOKEN_KEY),
      storage.removeItem(REFRESH_TOKEN_KEY),
      storage.removeItem(USER_KEY),
    ]);
  } catch (error) {
    console.error('Failed to clear auth session from storage:', error);
  }
};

export default storage;
