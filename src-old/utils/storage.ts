/**
 * Auth values live in localStorage ("keep me signed in") or sessionStorage (cleared when the
 * browser closes). Reads check both, so the rest of the app doesn't need to know which.
 */
export const storage = {
  get(key: string) {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  },
  set(key: string, value: string, remember = true) {
    (remember ? localStorage : sessionStorage).setItem(key, value);
    (remember ? sessionStorage : localStorage).removeItem(key);
  },
  remove(key: string) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};
