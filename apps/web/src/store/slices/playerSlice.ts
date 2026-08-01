import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Video } from '@/types';

interface PlayerState {
  currentVideo: Video | null;
  isPlaying: boolean;
  isMiniPlayer: boolean;
  volume: number;
  playbackRate: number;
}

const initialState: PlayerState = {
  currentVideo: null,
  isPlaying: false,
  isMiniPlayer: false,
  volume: 1,
  playbackRate: 1,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<Video | null>) => {
      state.currentVideo = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setMiniPlayer: (state, action: PayloadAction<boolean>) => {
      state.isMiniPlayer = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    setPlaybackRate: (state, action: PayloadAction<number>) => {
      state.playbackRate = action.payload;
    },
    clearPlayer: (state) => {
      state.currentVideo = null;
      state.isPlaying = false;
      state.isMiniPlayer = false;
    },
  },
});

export const {
  setCurrentVideo,
  setIsPlaying,
  setMiniPlayer,
  setVolume,
  setPlaybackRate,
  clearPlayer,
} = playerSlice.actions;
export default playerSlice.reducer;
