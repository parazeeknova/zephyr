import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HNStoryType } from '../components/hackernews';

interface HNShareState {
  story: HNStoryType | null;
  isSharing: boolean;
  setStory: (story: HNStoryType | null) => void;
  startSharing: (story: HNStoryType) => void;
  cancelSharing: () => void;
  clearState: () => void;
}

export const useHNShareStore = create<HNShareState>()(
  persist(
    (set) => ({
      story: null,
      isSharing: false,
      setStory: (story) => set({ story }),
      startSharing: (story) => set({ story, isSharing: true }),
      cancelSharing: () => set({ isSharing: false }),
      clearState: () => set({ story: null, isSharing: false }),
    }),
    {
      name: 'hn-share-storage',
    }
  )
);
