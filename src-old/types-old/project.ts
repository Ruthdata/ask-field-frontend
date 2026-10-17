export interface Project {
  _id: string;
  userId: string;
  title: string;
  participantView: string;
  pinned: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
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
  success?: boolean;
  message: string;
  data: Project;
}

export interface ProjectPagination {
  total: number;
  page: string;
  limit: string;
  pages: number;
}

export interface ListProjectsData {
  data: Project[];
  pagination: ProjectPagination;
}

export interface ListProjectsResponse {
  success?: boolean;
  message: string;
  data: ListProjectsData;
}

export interface ProjectMessageResponse {
  success?: boolean;
  message: string;
}
