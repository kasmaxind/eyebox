import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import api, { safeApiCall } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { demoUser } from '@/lib/demoData';
import type { RootState } from '@/store';
import { setUser, clearUser } from '@/store/slices/authSlice';
import type { AuthResponse, User } from '@/types';

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const { isLoading } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<User>('/auth/me');
        dispatch(setUser(data));
        return data;
      }, demoUser),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      dispatch(setUser(data.user));
      return data;
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string }) => {
      const { data } = await api.post<AuthResponse>('/auth/register', payload);
      return data;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      localStorage.removeItem('accessToken');
      dispatch(clearUser());
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
