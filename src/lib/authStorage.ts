export type StoredAuth = {
  token: string;
  userId: string;
  email: string;
  roles: string[];
};

const AUTH_STORAGE_KEY = "dictionary-auth";

export const getStoredAuth = (): StoredAuth | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
};

export const setStoredAuth = (auth: StoredAuth) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const clearStoredAuth = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getStoredToken = () => getStoredAuth()?.token ?? null;
