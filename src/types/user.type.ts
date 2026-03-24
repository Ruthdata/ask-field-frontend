export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    signupPlatform: 'email' | 'google';
    receivesUpdates: boolean;
    isVerified?: true;
    verificationToken?: string | null;
    verificationTokenExpires?: string | null;
    otp?: true;
    otpExpires?: string | null;
    isCompleteProfile: boolean;
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
  };