import { useLazyGetUserQuery } from "@/redux/api/slices/authSlice";
import { User } from "@/types/user.type";
import { getStoredToken } from "@/utils/auth";
import { useState, useEffect } from "react"

export const useCurrentUser = () => {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [getUser] = useLazyGetUserQuery()

  useEffect(() => {
    const fetchUser = async () => {
      const token = getStoredToken();
      
      try {
        const response = await getUser().unwrap()
        if(response.success){
          setUser(response.data.user)
        }
      } catch {
        setError("Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);


  const getInitials = () => {
    if (!user) return "??";
    return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return "";
    return  `${user?.firstName} ${user.lastName}`;
  };

  return { user, loading, error, getInitials, getFullName };
};