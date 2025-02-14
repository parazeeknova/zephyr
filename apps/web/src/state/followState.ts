import { atomWithStorage } from 'jotai/utils';

interface FollowState {
  [userId: string]: {
    isFollowing: boolean;
    followers: number;
    lastUpdated: number;
  };
}

export const followStateAtom = atomWithStorage<FollowState>('follow-state', {});
