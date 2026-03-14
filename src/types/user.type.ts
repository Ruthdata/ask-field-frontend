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
  }
  