export type StoredAuth = {
  token: string;
  userId: string;
};

const TOKEN_KEY = "token";
const USER_ID_KEY = "userId";

export const getStoredAuth = (): StoredAuth | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.localStorage.getItem(TOKEN_KEY);
  const userId = window.localStorage.getItem(USER_ID_KEY);

  if (!token || !userId) {
    return null;
  }

  return { token, userId };
};

export const setStoredAuth = (auth: StoredAuth) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, auth.token);
  window.localStorage.setItem(USER_ID_KEY, auth.userId);
};

export const clearStoredAuth = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_ID_KEY);
};

export const getStoredToken = () => getStoredAuth()?.token ?? null;
