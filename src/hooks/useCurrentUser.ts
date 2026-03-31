import { STORAGE_KEYS } from "@/config/constants";
import {
  useLazyGetParticipantQuery,
  useLazyGetResearcherQuery,
} from "@/redux/api/slices/userSlice";
import { JwtApiError } from "@/types/api.type";
import { Participant, Researcher } from "@/types/user.type";
import { formatApiError } from "@utils/helper";
import { useState, useEffect } from "react";

export const useCurrentUser = () => {
  const [participant, setParticipant] = useState<Participant | null>();
  const [researcher, setResearcher] = useState<Researcher | null>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [getParticipant] = useLazyGetParticipantQuery();
  const [getResearcher] = useLazyGetResearcherQuery();
  const [currentUserType, setCurrentUserType] = useState('')

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        const response = await getParticipant().unwrap();
        if (response.success) {
          if(response.data.userType){
            setCurrentUserType(response.data.userType)
          }
          setParticipant(response.data);
        }
        setLoading(false);
      } catch (err: any) {
        setLoading(false);
        const msg = formatApiError(err)

        const errorMessage = msg || "Failed to fetch user";
        setError(errorMessage);
      }
    };

    fetchParticipant();
  }, []);
  
  useEffect(() => {
    const fetchResearcher = async () => {
      try {
        const response = await getResearcher().unwrap();
        if (response.success) {
          if(response.data.userType){
            setCurrentUserType(response.data.userType)
          }
          setResearcher(response.data);
        }
        setLoading(false);
      } catch (err: any) {
        setLoading(false);
        const msg = formatApiError(err)

        const errorMessage = msg || "Failed to fetch user";
        setError(errorMessage);
      }
    };

    fetchResearcher();
  }, []);

  const refetchUser = async () => {
    try {
      const response1 = await getParticipant().unwrap();
      const response2 = await getResearcher().unwrap();
      if (response1.success) setParticipant(response1.data);
      if (response2.success) setResearcher(response2.data);
    } catch (err) {
      console.error("Failed to refetch user", err);
    }
  };

  const getParticipantInitials = () => {
    if (!participant) return "??";
    return `${participant.firstName?.[0] ?? ""}${
      participant.lastName?.[0] ?? ""
    }`.toUpperCase();
  };

  const getResearcherInitials = () => {
    if (!researcher) return "??";
    return `${researcher.firstName?.[0] ?? ""}${
      researcher.lastName?.[0] ?? ""
    }`.toUpperCase();
  };

  const getParticipantFullName = () => {
    if (!participant) return "";
    return `${participant?.firstName} ${participant.lastName}`;
  };

  const getResearcherFullName = () => {
    if (!researcher) return "";
    return `${researcher?.firstName} ${researcher.lastName}`;
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
    getParticipantInitials,
    getParticipantFirstName,
    getResearcherInitials,
    getResearcherFullName,
    getResearcherFirstName,
    getParticipantFullName,
    refetchUser,
    currentUserType
  };
};
