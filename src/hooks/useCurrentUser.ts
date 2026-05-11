import { STORAGE_KEYS } from "@/config/constants";
import {
  useLazyGetParticipantQuery,
  useLazyGetResearcherQuery,
} from "@/redux/api/slices/userSlice";
import { Participant, Researcher } from "@/types/user.type";
import { formatApiError } from "@utils/helper";
import { getUserType } from "@/utils/auth";
import { useState, useEffect } from "react";

export const useCurrentUser = () => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [researcher, setResearcher] = useState<Researcher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [getParticipant] = useLazyGetParticipantQuery();
  const [getResearcher] = useLazyGetResearcherQuery();

  const userType = getUserType(); // reads from localStorage

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (userType === "researcher") {
          const response = await getResearcher().unwrap();
          if (response.success) setResearcher(response.data);
        } else if (userType === "participant") {
          const response = await getParticipant().unwrap();
          if (response.success) setParticipant(response.data);
        }
      } catch (err: any) {
        const msg = formatApiError(err);
        setError(msg || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userType]);

  const refetchUser = async () => {
    try {
      if (userType === "researcher") {
        const response = await getResearcher().unwrap();
        if (response.success) setResearcher(response.data);
      } else {
        const response = await getParticipant().unwrap();
        if (response.success) setParticipant(response.data);
      }
    } catch (err) {
      console.error("Failed to refetch user", err);
    }
  };

  const getParticipantInitials = () => {
    if (!participant) return "??";
    return `${participant.firstName?.[0] ?? ""}${participant.lastName?.[0] ?? ""}`.toUpperCase();
  };

  const getResearcherInitials = () => {
    if (!researcher) return "??";
    return `${researcher.firstName?.[0] ?? ""}${researcher.lastName?.[0] ?? ""}`.toUpperCase();
  };

  const getParticipantFullName = () => {
    if (!participant) return "";
    return `${participant.firstName} ${participant.lastName}`;
  };

  const getResearcherFullName = () => {
    if (!researcher) return "";
    return `${researcher.firstName} ${researcher.lastName}`;
  };

  const getParticipantFirstName = () => {
    if (!participant?.firstName) return "";
    return (
      participant.firstName.charAt(0).toUpperCase() +
      participant.firstName.slice(1)
    );
  };

  const getResearcherFirstName = () => {
    if (!researcher?.firstName) return "";
    return (
      researcher.firstName.charAt(0).toUpperCase() +
      researcher.firstName.slice(1)
    );
  };

  return {
    participant,
    researcher,
    loading,
    error,
    currentUserType: userType,
    getParticipantInitials,
    getParticipantFirstName,
    getResearcherInitials,
    getResearcherFullName,
    getResearcherFirstName,
    getParticipantFullName,
    refetchUser,
  };
};
