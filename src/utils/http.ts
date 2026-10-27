import { Platform } from 'react-native';
import { isDev } from './constants';

export interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export type HTTPResponse<T = any> = {
  success: boolean;
  msg: string;
  data?: T;
  pagination?: PaginationMeta;
  meta?: Record<string, any>;
  status?: number;
};

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
}

export interface HTTPError extends Error {
  status?: number;
  msg?: string;
  data?: any;
  errors?: any;
  response?: {
    status: number;
    data?: any;
  };
}

// Default Base URL: configured for local dev (Android emulator vs iOS simulator / default)
// export const DEFAULT_BASE_URL = isDev ? 'http://localhost:8000/api' : 'http://localhost:8000/api';
// export const DEFAULT_BASE_URL = isDev ? 'http://10.0.2.2:8000/api' : 'http://10.0.2.2:8000/api';
export const DEFAULT_BASE_URL = isDev ? 'http://172.20.10.4:8000/api' : 'http://172.20.10.4:8000/api';

let currentBaseUrl: string = DEFAULT_BASE_URL;
let authToken: string | null = null;
let tokenGetter: (() => Promise<string | null> | string | null) | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const setBaseUrl = (url: string) => {
  currentBaseUrl = url.replace(/\/+$/, '');
};

export const getBaseUrl = (): string => {
  return currentBaseUrl;
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = (): string | null => {
  return authToken;
};

export const setTokenGetter = (
  getter: () => Promise<string | null> | string | null,
) => {
  tokenGetter = getter;
};

export const setOnUnauthorized = (handler: () => void) => {
  unauthorizedHandler = handler;
};

const buildUrl = (path: string, params?: Record<string, any>): string => {
  let url = path;

  // If path is not an absolute URL, prepend base URL
  if (!/^https?:\/\//i.test(path)) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    url = `${currentBaseUrl}${cleanPath}`;
  }

  if (params && Object.keys(params).length > 0) {
    const queryParts: string[] = [];
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
        );
      }
    });

    if (queryParts.length > 0) {
      url += (url.includes('?') ? '&' : '?') + queryParts.join('&');
    }
  }

  return url;
};

const handleRequest = async <T = any>(
  path: string,
  options: RequestOptions = {},
): Promise<HTTPResponse<T>> => {
  const {
    method = 'GET',
    headers: customHeaders = {},
    params,
    data,
    timeout = 15000,
    signal: userSignal,
    ...restOptions
  } = options;

  const url = buildUrl(path, params);

  // Setup timeout abort controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  // Chain user abort signal if provided
  if (userSignal) {
    userSignal.addEventListener('abort', () => controller.abort());
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...((customHeaders as Record<string, string>) || {}),
    };

    // Attach authentication token if available
    let token = authToken;
    if (!token && tokenGetter) {
      try {
        token = await tokenGetter();
      } catch (e) {
        console.warn('Failed to retrieve auth token from tokenGetter:', e);
      }
    }

    if (token && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    let body: any;

    if (data !== undefined && data !== null) {
      const isFormData =
        typeof FormData !== 'undefined' && data instanceof FormData;

      if (isFormData) {
        // Let fetch automatically set multipart boundary for FormData
        body = data;
      } else if (typeof data === 'object') {
        if (!headers['Content-Type'] && !headers['content-type']) {
          headers['Content-Type'] = 'application/json';
        }
        body = JSON.stringify(data);
      } else {
        body = data;
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
      ...restOptions,
    });

    let payload: any = null;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    } else {
      const text = await response.text();
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text ? { msg: text } : null;
      }
    }

    if (!response.ok) {
      if (response.status === 401 && unauthorizedHandler) {
        unauthorizedHandler();
      }

      const error: HTTPError = new Error(
        payload?.msg ||
        payload?.message ||
        `Request failed with status ${response.status}`,
      );
      error.status = response.status;
      error.msg = payload?.msg || payload?.message;
      error.data = payload?.data;
      error.errors = payload?.errors;
      error.response = {
        status: response.status,
        data: payload,
      };

      throw error;
    }

    // If backend returns AppResponse directly: { msg, status, data, pagination, meta }
    if (payload && typeof payload === 'object') {
      if (payload.success === undefined) {
        payload.success = response.ok;
      }
      return payload as HTTPResponse<T>;
    }

    return {
      success: true,
      msg: 'Success',
      data: payload as T,
      status: response.status,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      const timeoutError: HTTPError = new Error('Request timed out');
      timeoutError.status = 408;
      timeoutError.msg = 'Request timed out';
      throw timeoutError;
    }

    if (__DEV__) {
      console.error(`[HTTP Error] ${method} ${url}:`, error);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const get = async <T = any>(
  url: string,
  options?: RequestOptions,
): Promise<HTTPResponse<T>> => {
  return handleRequest<T>(url, { ...options, method: 'GET' });
};

export const post = async <T = any>(
  url: string,
  data?: any,
  options?: RequestOptions,
): Promise<HTTPResponse<T>> => {
  return handleRequest<T>(url, { ...options, method: 'POST', data });
};

export const put = async <T = any>(
  url: string,
  data?: any,
  options?: RequestOptions,
): Promise<HTTPResponse<T>> => {
  return handleRequest<T>(url, { ...options, method: 'PUT', data });
};

export const patch = async <T = any>(
  url: string,
  data?: any,
  options?: RequestOptions,
): Promise<HTTPResponse<T>> => {
  return handleRequest<T>(url, { ...options, method: 'PATCH', data });
};

export const deleteRequest = async <T = any>(
  url: string,
  data?: any,
  options?: RequestOptions,
): Promise<HTTPResponse<T>> => {
  return handleRequest<T>(url, { ...options, method: 'DELETE', data });
};

export const getErrorMessage = (
  error: any,
  defaultMessage = 'An error occurred',
): string => {
  return (
    error?.response?.data?.msg ||
    error?.data?.msg ||
    error?.msg ||
    error?.message ||
    defaultMessage
  );
};

export const http = {
  get,
  post,
  put,
  patch,
  delete: deleteRequest,
  setBaseUrl,
  getBaseUrl,
  setAuthToken,
  getAuthToken,
  setTokenGetter,
  setOnUnauthorized,
  getErrorMessage,
};

export default http;
