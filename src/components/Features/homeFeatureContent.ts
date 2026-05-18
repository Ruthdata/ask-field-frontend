import {
  BadgeCheck,
  FileCheck2,
  GitCompareArrows,
  Globe2,
  HandCoins,
  Info,
  SearchCheck,
  ShieldCheck,
  UserCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface HomeCardContent {
  title: string;
  copy: string;
  icon: LucideIcon;
}

export interface JourneyContent extends HomeCardContent {
  button: string;
  to: string;
}

export interface StepContent {
  title: string;
  copy: string;
}

export const journeys: JourneyContent[] = [
  {
    title: "For Researchers",
    copy: "Recruit qualified participants for surveys, interviews, usability tests, academic research, product research, AI evaluation, and field/community studies. Define eligibility, add screeners, manage applications, and document consent in one workflow.",
    button: "Start a Study",
    to: "/auth/sign-up/researcher",
    icon: SearchCheck,
  },
  {
    title: "For Participants",
    copy: "Join legitimate research studies, share your experience, and get paid fairly for your time. You choose which studies to apply for, and each study should clearly show its purpose, time commitment, compensation, and data use.",
    button: "Join Paid Studies",
    to: "/auth/sign-up/participant",
    icon: WalletCards,
  },
];

export const researcherSteps: StepContent[] = [
  {
    title: "Create your study",
    copy: "Add your study title, description, timeline, and research type.",
  },
  {
    title: "Define participant criteria",
    copy: "Choose country, language, eligibility, demographics, occupation, or custom criteria.",
  },
  {
    title: "Add screener questions",
    copy: "Filter participants before approval.",
  },
  {
    title: "Add consent and ethics information",
    copy: "Share purpose, data use, compensation, and consent details.",
  },
  {
    title: "Review applicants",
    copy: "Approve qualified participants and manage study status.",
  },
  {
    title: "Track completion and payment",
    copy: "Keep participation and compensation organized.",
  },
];

export const participantSteps: StepContent[] = [
  {
    title: "Create your profile",
    copy: "Tell us basic information so we can match you with relevant studies.",
  },
  {
    title: "Browse or receive matched studies",
    copy: "See studies that fit your profile and location.",
  },
  {
    title: "Check eligibility",
    copy: "Answer screener questions before applying.",
  },
  {
    title: "Review study details",
    copy: "See purpose, time, compensation, and data use before participating.",
  },
  {
    title: "Complete approved studies",
    copy: "Participate only in studies you choose.",
  },
  {
    title: "Track payment status",
    copy: "Follow your application, completion, and payment progress.",
  },
];

export const globalReachCards: HomeCardContent[] = [
  {
    title: "Global by design",
    copy: "Recruit participants across countries, regions, languages, and communities.",
    icon: Globe2,
  },
  {
    title: "Strong Global South access",
    copy: "Build studies that include perspectives often missing from Western-centered research panels.",
    icon: UsersRound,
  },
  {
    title: "Open to comparative research",
    copy: "Support cross-country, diaspora, Global North, Global South, and mixed-sample studies.",
    icon: GitCompareArrows,
  },
];

export const trustCards: HomeCardContent[] = [
  {
    title: "Clear study information",
    copy: "Each study should show purpose, eligibility, time commitment, compensation, and data use before participants apply.",
    icon: Info,
  },
  {
    title: "Consent-first participation",
    copy: "Participants should see plain-language consent information before joining a study.",
    icon: FileCheck2,
  },
  {
    title: "Fair compensation",
    copy: "Studies should clearly state payment amount, currency, method, and timing.",
    icon: HandCoins,
  },
  {
    title: "Researcher accountability",
    copy: "Researcher and organization details should be visible before participation.",
    icon: BadgeCheck,
  },
  {
    title: "Admin review",
    copy: "Studies can be reviewed before publication to reduce scams, abuse, and unclear research requests.",
    icon: ShieldCheck,
  },
  {
    title: "Participant choice",
    copy: "Participants choose which studies to apply for and can track their study status.",
    icon: UserCheck,
  },
];
