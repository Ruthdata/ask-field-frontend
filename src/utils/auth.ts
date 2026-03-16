// utils/auth.ts

import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "./storage";

export const getStoredToken = () => {
  return storage.get(STORAGE_KEYS.TOKEN);
};

export const isAuthenticated = () => {
  return !!getStoredToken();
};
