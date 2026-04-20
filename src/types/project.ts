export interface Project {
  _id: string;
  userId: string;
  title: string;
  participantView: string;
  pinned: boolean;
  pinnedAt: Date | null;
}

export interface CreateProjectPayload {
  title: string;
  participantView: string;
}

export interface RenameProjectPayload {
  id: string;
  title: string;
}

export interface PinProjectPayload {
  id: string;
}

export interface DeleteProjectPayload {
  id: string;
}

export interface ListProjectsPayload {
  page: number;
  limit: number;
}

export interface ProjectResponse {
  message: string;
  data: Project;
}

export interface ListProjectsResponse {
  message: string;
  data: Project[];
}

export interface ProjectMessageResponse {
  message: string;
}
