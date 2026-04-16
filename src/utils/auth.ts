import { STORAGE_KEYS } from "@/config/constants";
import { storage } from "./storage";

export const getStoredToken = () => {
  return storage.get(STORAGE_KEYS.TOKEN);
};

export const isAuthenticated = () => {
  return !!getStoredToken();
};

export const getUserType = () => {
  return storage.get(STORAGE_KEYS.USER_TYPE);
};

export const isResearcher = () => getUserType() === "researcher";
export const isParticipant = () => getUserType() === "participant";
