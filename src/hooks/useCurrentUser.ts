import { STORAGE_KEYS } from "@/config/constants";
import {
  useLazyGetRefreshTokenQuery,
  useLazyGetUserQuery,
} from "@/redux/api/slices/authSlice";
import { JwtApiError } from "@/types/api.type";
import { User } from "@/types/user.type";
import { getStoredToken } from "@/utils/auth";
import { storage } from "@/utils/storage";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [getUser] = useLazyGetUserQuery();
  const [triggerRefresh] = useLazyGetRefreshTokenQuery();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {

      try {
        const response = await getUser().unwrap();
        if (response.success) {
          setUser(response.data);
        }
        setLoading(false)
      } catch (err: any) {
        setLoading(false)
        const error = err as JwtApiError;

        const errorMessage = error.data.message.name || "Failed to fetch user";
        setError(errorMessage);
      }
    };

    fetchUser();
  }, []);

  const getInitials = () => {
    if (!user) return "??";
    return `${user.firstName?.[0] ?? ""}${
      user.lastName?.[0] ?? ""
    }`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return "";
    return `${user?.firstName} ${user.lastName}`;
  };

  const getFirstName = () => {
    if (!user?.firstName) return "";
    return user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);
  };

  return { user, loading, error, getInitials, getFullName, getFirstName };
};
