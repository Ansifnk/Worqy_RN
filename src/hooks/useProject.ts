import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { http } from '../utils/http';
import { ProjectItem, ProjectFormData } from '../screens/projects/types';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (userId?: string) => [...projectKeys.lists(), userId] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export interface UseProjectReturn {
  projects: ProjectItem[];
  loading: boolean;
  error: string | null;
  addProject: (projectData: ProjectFormData) => Promise<string>;
  updateProject: (id: string, projectData: Partial<ProjectFormData>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Promise<ProjectItem | null>;
  refresh: () => Promise<void>;
}

export const useProject = (): UseProjectReturn => {
  const { user } = useAppContext();
  const queryClient = useQueryClient();

  // Helper to sort projects with latest created/updated first
  const sortProjects = useCallback((items: ProjectItem[]): ProjectItem[] => {
    return [...items].sort((a, b) => {
      const timeA =
        a.updatedAt?.toMillis?.() ??
        (typeof a.updatedAt === 'string'
          ? new Date(a.updatedAt).getTime()
          : typeof a.updatedAt === 'number'
          ? a.updatedAt
          : 0);
      const timeB =
        b.updatedAt?.toMillis?.() ??
        (typeof b.updatedAt === 'string'
          ? new Date(b.updatedAt).getTime()
          : typeof b.updatedAt === 'number'
          ? b.updatedAt
          : 0);
      if (timeA !== timeB) return timeB - timeA;
      return a.name.localeCompare(b.name);
    });
  }, []);

  // TanStack Query for fetching projects via HTTP
  const {
    data: rawProjects = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<ProjectItem[]>({
    queryKey: projectKeys.list(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await http.get<ProjectItem[]>('/projects', {
        params: { limit: 1000 },
      });
      return res.data || [];
    },
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const projects = useMemo(() => {
    return sortProjects(rawProjects);
  }, [rawProjects, sortProjects]);

  // Mutation: Create project (POST /projects)
  const addMutation = useMutation({
    mutationFn: async (newProjectData: ProjectFormData) => {
      const res = await http.post<ProjectItem>('/projects', newProjectData);
      if (!res.data) {
        throw new Error(res.msg || 'Failed to create project');
      }
      return res.data;
    },
    onSuccess: (newProject) => {
      queryClient.setQueryData<ProjectItem[]>(projectKeys.list(user?.id), (old = []) => [
        newProject,
        ...old.filter((item) => item.id !== newProject.id),
      ]);
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });

  // Mutation: Update project (PUT /projects/:id)
  const updateMutation = useMutation({
    mutationFn: async ({ id, projectData }: { id: string; projectData: Partial<ProjectFormData> }) => {
      const res = await http.put<ProjectItem>(`/projects/${id}`, projectData);
      if (!res.data) {
        throw new Error(res.msg || 'Failed to update project');
      }
      return res.data;
    },
    onSuccess: (updatedProject) => {
      queryClient.setQueryData<ProjectItem[]>(projectKeys.list(user?.id), (old = []) =>
        old.map((item) => (item.id === updatedProject.id ? updatedProject : item))
      );
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });

  // Mutation: Delete project (DELETE /projects/:id)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await http.delete(`/projects/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<ProjectItem[]>(projectKeys.list(user?.id), (old = []) =>
        old.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });

  const addProject = useCallback(
    async (projectData: ProjectFormData): Promise<string> => {
      const result = await addMutation.mutateAsync(projectData);
      return result.id;
    },
    [addMutation]
  );

  const updateProject = useCallback(
    async (id: string, projectData: Partial<ProjectFormData>): Promise<void> => {
      await updateMutation.mutateAsync({ id, projectData });
    },
    [updateMutation]
  );

  const deleteProject = useCallback(
    async (id: string): Promise<void> => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  const getProject = useCallback(
    async (id: string): Promise<ProjectItem | null> => {
      const cached = projects.find((p) => p.id === id);
      if (cached) return cached;
      try {
        const res = await http.get<ProjectItem>(`/projects/${id}`);
        return res.data || null;
      } catch (e) {
        console.warn('Failed to fetch project by id:', e);
        return null;
      }
    },
    [projects]
  );

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const error = useMemo(() => {
    if (queryError) return (queryError as Error).message || 'Failed to load projects';
    if (addMutation.error) return (addMutation.error as Error).message || 'Failed to add project';
    if (updateMutation.error) return (updateMutation.error as Error).message || 'Failed to update project';
    if (deleteMutation.error) return (deleteMutation.error as Error).message || 'Failed to delete project';
    return null;
  }, [queryError, addMutation.error, updateMutation.error, deleteMutation.error]);

  return {
    projects,
    loading: isLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    refresh,
  };
};
