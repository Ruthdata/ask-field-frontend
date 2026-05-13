export interface Survey {
  _id?: string;
  surveyId?: string;
  userId: string;
  projectId: string;
  surveyType: string;
  surveyName: string;
  internalSurveyName: string;
  surveyDescription: string;
  surveyLabel: string;
  usableDevices: string[];
  surveyEquipment: string;
  minimumAge?: number;
  maximumAge?: number;
  gender?: string;
  contentWarning: string;
  surveyURL: string;
  toRecordId: string;
  handleSubmission: string;
  addToParticipantGroup: string;
  howToFindParticipant: string;
  numberOfParticipants: number;
  howToScreenParticipants: string;
  surveyDistribution: string;
  status: "draft" | "published" | "closed";
  surveyCrendentials: string;
  totalSubmission: number;
  inputRejection: number;
  surveyDuration: number;
  surveyAmount: number;
}

export interface CreateDraftSurveyPayload {
  projectId: string;
  surveyName: string;
}

export interface DraftSurvey {
  surveyId: string;
  _id?: string;
  id?: string;
  projectId: string;
  userId: string;
  surveyName: string;
  status: "draft";
}

export interface UpdateDraftSurveyPayload {
  surveyId: string;
  body: Partial<Survey> | Record<string, unknown>;
}

export type PublishSurveyPayload = string;

export interface GetSurveysByProjectPayload {
  projectId: string;
  status: "published" | "draft" | "closed";
}

export interface GetAllSurveysPayload {
  status: "published" | "draft" | "closed";
}

export type SurveyListPayload =
  | Survey[]
  | {
      data?: Survey[];
      items?: Survey[];
      results?: Survey[];
    };

export interface SurveyResponse {
  message: string;
  data: Survey;
}

export interface SurveysListResponse {
  message: string;
  data: SurveyListPayload;
}

export type SurveyActionStatus =
  | "in-progress"
  | "submitted"
  | "approved"
  | "rejected";

export interface SurveyAction {
  _id?: string;
  surveyActionId?: string;
  surveyId: string;
  participantId: string;
  status: SurveyActionStatus;
  startedAt: string;
  submittedAt?: string;
  timeSpent?: number;
}

export interface CreateSurveyActionPayload {
  surveyId: string;
}

export type SurveyActionResponse = {
  success: boolean;
  message: string;
  data: SurveyAction;
};

export type SurveyActionsListResponse = {
  success: boolean;
  message: string;
  data: SurveyAction[];
};

export interface CreateDraftSurveyResponse {
  success?: boolean;
  error?: string;
  message: string;
  data: DraftSurvey;
}

export interface SurveyMessageResponse {
  message: string;
}

export type SurveyTypeOption = "external" | "aiTaskBuilder";

export type StudyLabelOption =
  | "survey"
  | "decision making"
  | "writing"
  | "interview"
  | "ai task"
  | "none";

export interface SurveyStepTwoData {
  surveyName: string;
  internalSurveyName: string;
  surveyDescription: string;
  contentWarning: string;
  surveyLabel: StudyLabelOption | "";
  usableDevices: string[];
  surveyEquipment: string;
  minimumAge: string;
  maximumAge: string;
  gender: string;
}

export interface CompletionPath {
  id: string;
  name: string;
  handleSubmission: string;
  addToParticipantGroup: string;
  redirectUrl: string;
  completionCode: string;
}

export interface SurveyStepThreeData {
  surveyURL: string;
  toRecordId: string;
  completionPaths: CompletionPath[];
}

export interface SurveyStepFourData {
  howToFindParticipant: string;
  numberOfParticipants: string;
  howToScreenParticipants: string;
  surveyDistribution: string;
  surveyCrendentials: string;
  totalSubmission: string;
  inputRejection: string;
}

export interface SurveyStepFiveData {
  surveyDuration: string;
  surveyAmount: string;
}

export interface SurveyFormData {
  surveyType: SurveyTypeOption | null;
  draftSurveyId?: string;
  stepTwoData: SurveyStepTwoData;
  stepThreeData: SurveyStepThreeData;
  stepFourData: SurveyStepFourData;
  stepFiveData: SurveyStepFiveData;
}
