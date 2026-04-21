import { apiSlice } from "./slices/appSlice";
import {
  CreateProjectPayload,
  RenameProjectPayload,
  ListProjectsPayload,
  ProjectResponse,
  ListProjectsResponse,
  ProjectMessageResponse,
} from "@/types/project";

export const projectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /projects/list-user-projects?page=1&limit=10
    listUserProjects: builder.query<ListProjectsResponse, ListProjectsPayload>({
      query: ({ page, limit }) => ({
        url: "/projects/list-user-projects",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Projects"],
    }),

    // POST /projects/create-project
    createProject: builder.mutation<ProjectResponse, CreateProjectPayload>({
      query: (body) => ({
        url: "/projects/create-project",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Projects"],
    }),

    // GET /projects/get-project/:id
    getProjectById: builder.query<ProjectResponse, string>({
      query: (id) => ({
        url: `/projects/get-project/${id}`,
        method: "GET",
      }),
      providesTags: ["Projects"],
    }),

    // PUT /projects/rename-project/:id
    renameProject: builder.mutation<
      ProjectMessageResponse,
      RenameProjectPayload
    >({
      query: ({ id, title }) => ({
        url: `/projects/rename-project/${id}`,
        method: "PUT",
        body: { title },
      }),
      invalidatesTags: ["Projects"],
    }),

    // PUT /projects/pin-project/:id
    pinProject: builder.mutation<ProjectMessageResponse, string>({
      query: (id) => ({
        url: `/projects/pin-project/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Projects"],
    }),

    // DELETE /projects/delete-project/:id
    deleteProject: builder.mutation<ProjectMessageResponse, string>({
      query: (id) => ({
        url: `/projects/delete-project/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),
  }),
});

export const {
  useListUserProjectsQuery,
  useLazyListUserProjectsQuery,
  useCreateProjectMutation,
  useGetProjectByIdQuery,
  useLazyGetProjectByIdQuery,
  useRenameProjectMutation,
  usePinProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
