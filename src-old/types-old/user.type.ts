export interface Participant {
  _id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires: Date | null;
  otp?: string;
  otpExpires: Date | null;
  signupPlatform: "email" | "google";
  receivesUpdates: boolean;
  image?: {
    imageUrl?: string;
    publicId?: string;
  };
  googleId?: string;
  subscriptionStatus?: string; // optional, used in isSubscriptionActive
  subscriptionExpiry?: Date; // optional, used in isSubscriptionActive
  userType?: string; // optional, used in JWT methods
  isCompleteProfile: boolean;
}
export interface Researcher {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires: Date | null;
  otp?: string;
  otpExpires: Date | null;
  signupPlatform: "email" | "google";
  image?: {
    imageUrl?: string;
    publicId?: string;
  };
  googleId?: string;
  subscriptionStatus?: string; // optional, used in isSubscriptionActive
  subscriptionExpiry?: Date; // optional, used in isSubscriptionActive
  userType?: string; // optional, used in JWT methods
  isCompleteProfile: boolean;
  jobTitle: string;
  organizationType: string;
  organizationName: string;
  companyName: string;
  country: string;
}

export interface CompleteProfile {
  gender: string;
  ethnic: string;
  educationLevel: string;
  isStudent: string;
  dob_day: string;
  dob_month: string;
  dob_year: string;
  firstLanguage: string;
  fluentLanguage: string;
  dialect: string;
  countryOfBirth: string;
  countryOfResidence: string;
  pob: string;
  mostLifeTime: string;
  mostTimeSpent: string;
  currency: string;
  payPerHour: string;
  workHour: string;
  shareLinkedin: string;
  employmentStatus: string;
}
