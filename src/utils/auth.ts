// utils/auth.ts

import { STORAGE_KEYS } from "@/config/constants";

export const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

export const isAuthenticated = () => {
  return !!getToken();
};
