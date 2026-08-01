'use client';

import { useQuery } from '@tanstack/react-query';
import api, { safeApiCall } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import {
  getDemoVideo,
  demoComments,
  demoVideos,
  getDemoChannel,
  getDemoChannelVideos,
} from '@/lib/demoData';
import type { Video, Comment, Channel } from '@/types';

export function useVideo(id: string) {
  return useQuery({
    queryKey: queryKeys.video.detail(id),
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Video>(`/videos/${id}`);
        return data;
      }, getDemoVideo(id)!),
    enabled: !!id,
  });
}

export function useVideoComments(id: string) {
  return useQuery({
    queryKey: queryKeys.video.comments(id),
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Comment[]>(`/videos/${id}/comments`);
        return data;
      }, demoComments),
    enabled: !!id,
  });
}

export function useRelatedVideos(id: string) {
  return useQuery({
    queryKey: queryKeys.video.related(id),
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Video[]>(`/videos/${id}/related`);
        return data;
      }, demoVideos.slice(0, 10)),
    enabled: !!id,
  });
}

export function useChannel(handle: string) {
  return useQuery({
    queryKey: queryKeys.channel.detail(handle),
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Channel>(`/channels/${handle}`);
        return data;
      }, getDemoChannel(handle)!),
    enabled: !!handle,
  });
}

export function useChannelVideos(handle: string) {
  return useQuery({
    queryKey: queryKeys.channel.videos(handle),
    queryFn: () =>
      safeApiCall(async () => {
        const { data } = await api.get<Video[]>(`/channels/${handle}/videos`);
        return data;
      }, getDemoChannelVideos(handle)),
    enabled: !!handle,
  });
}
