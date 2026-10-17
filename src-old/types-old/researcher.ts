export interface RegisterResearcherPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  signupPlatform: "email" | "google";
}

export interface RegisterResearcherResponse {
  message: string;
  data: {
    email: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    verificationToken: string;
    verificationTokenExpires: string;
    otp: string;
    otpExpires: string;
    signupPlatform: string;
    image: {
      imageUrl: string;
      publicId: string;
    };
    googleId: string;
    subscriptionStatus: string;
    subscriptionExpiry: string;
    userType: string;
    isCompleteProfile: boolean;
    jobTitle: string;
    organizationType: string;
    organizationName: string;
    country: string;
  };
}

export interface ResearcherFormData {
  email: string;
  country: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  organizationName: string;
  organizationType: string;
  password: string;
  confirmPassword: string;
}

export interface DashboardStats {
  activeSurveys: number;
  liveSurveys: number;
  draftSurveys: number;
  closedSurveys: number;
  researchSpent: number;
}

export interface DashboardStatsResponse {
  message: string;
  data: DashboardStats;
}