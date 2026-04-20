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
  projectId: string;
  userId: string;
  surveyName: string;
  status: "draft";
}

export interface UpdateDraftSurveyPayload {
  surveyId: string;
  body: Partial<Survey>;
}

export type PublishSurveyPayload = string;

export interface GetSurveysByProjectPayload {
  projectId: string;
  status: "published" | "draft" | "closed";
}

export interface SurveyResponse {
  message: string;
  data: Survey;
}

export interface SurveysListResponse {
  message: string;
  data: Survey[];
}

export interface CreateDraftSurveyResponse {
  message: string;
  data: DraftSurvey;
}

export interface SurveyMessageResponse {
  message: string;
}