import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { FailureAnalysis, SpecRequest } from '@/lib/types';

// Query keys
export const queryKeys = {
  user: ['user'] as const,
  usage: ['usage'] as const,
  specs: (params?: { limit?: number; offset?: number }) => ['specs', params] as const,
  spec: (id: string) => ['spec', id] as const,
  analyses: (params?: { limit?: number; offset?: number }) => ['analyses', params] as const,
  analysis: (id: string) => ['analysis', id] as const,
  cases: (filters?: Record<string, string>) => ['cases', filters] as const,
  case: (id: string) => ['case', id] as const,
  pendingFeedback: ['pendingFeedback'] as const,
  adminOverview: ['adminOverview'] as const,
  adminUsers: (search?: string) => ['adminUsers', search] as const,
  adminActivity: ['adminActivity'] as const,
  adminLogs: (path?: string) => ['adminLogs', path] as const,
};

// User & Auth
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => api.getCurrentUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

export function useUsage() {
  return useQuery({
    queryKey: queryKeys.usage,
    queryFn: () => api.getCurrentUserUsage(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; company?: string; role?: string }) =>
      api.updateProfile(data),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.user, user);
    },
  });
}

// Spec Requests
export function useSpecList(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.specs(params),
    queryFn: () => api.listSpecRequests(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useSpec(id: string) {
  return useQuery({
    queryKey: queryKeys.spec(id),
    queryFn: () => api.getSpecRequest(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
}

export function useCreateSpec() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SpecRequest>) => api.createSpecRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.specs() });
      queryClient.invalidateQueries({ queryKey: queryKeys.usage });
    },
  });
}

// Failure Analyses
export function useAnalysisList(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.analyses(params),
    queryFn: () => api.listFailureAnalyses(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAnalysis(id: string) {
  return useQuery({
    queryKey: queryKeys.analysis(id),
    queryFn: () => api.getFailureAnalysis(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FailureAnalysis>) => api.createFailureAnalysis(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.analyses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.usage });
    },
  });
}

// Cases
export function useCaseList(filters?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.cases(filters),
    queryFn: () => api.listCases(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: queryKeys.case(id),
    queryFn: () => api.getCase(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
}

// Feedback
export function usePendingFeedback() {
  return useQuery({
    queryKey: queryKeys.pendingFeedback,
    queryFn: () => api.getPendingFeedback(),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof api.submitFeedback>[0]) =>
      api.submitFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingFeedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.analyses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.specs() });
    },
  });
}

// Admin
export function useAdminOverview() {
  return useQuery({
    queryKey: queryKeys.adminOverview,
    queryFn: () => api.getAdminOverview(),
    staleTime: 1000 * 30, // 30 seconds
    retry: false,
  });
}

export function useAdminUsers(search?: string) {
  return useQuery({
    queryKey: queryKeys.adminUsers(search),
    queryFn: () => api.getAdminUsers(search),
    staleTime: 1000 * 30, // 30 seconds
    retry: false,
  });
}

export function useAdminActivity() {
  return useQuery({
    queryKey: queryKeys.adminActivity,
    queryFn: () => api.getAdminActivity(),
    staleTime: 1000 * 30, // 30 seconds
    retry: false,
  });
}

export function useAdminLogs(path?: string) {
  return useQuery({
    queryKey: queryKeys.adminLogs(path),
    queryFn: () => api.getAdminRequestLogs(path),
    staleTime: 1000 * 30, // 30 seconds
    retry: false,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { plan?: string; role?: string } }) =>
      api.updateAdminUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOverview });
    },
  });
}
