import kyInstance from '@/lib/ky';
import { cn } from '@/lib/utils';
import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { VoteInfo } from '@zephyr/db';
import { useToast } from '@zephyr/ui/hooks/use-toast';
import { Button } from '@zephyr/ui/shadui/button';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';

interface AuraVoteButtonProps {
  postId: string;
  initialState: VoteInfo;
  authorName: string;
}

export default function AuraVoteButton({
  postId,
  initialState,
  authorName,
}: AuraVoteButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ['vote-info', postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/votes`).json<VoteInfo>(),
    initialData: initialState,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const { mutate } = useMutation({
    mutationFn: (vote: number) =>
      vote === data.userVote
        ? kyInstance.delete(`/api/posts/${postId}/votes`)
        : kyInstance.post(`/api/posts/${postId}/votes`, { json: { vote } }),
    onMutate: async (newVote) => {
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<VoteInfo>(queryKey);
      queryClient.setQueryData<VoteInfo>(queryKey, (old) => {
        if (!old) {
          return old;
        }
        const voteChange = calculateVoteChange(old.userVote, newVote);
        return {
          aura: old.aura + voteChange,
          userVote: newVote === old.userVote ? 0 : newVote,
        };
      });

      // biome-ignore lint/suspicious/noExplicitAny: any
      queryClient.setQueryData(['post', postId], (oldPost: any) => {
        if (!oldPost) {
          return oldPost;
        }
        const voteChange = calculateVoteChange(
          oldPost.vote[0]?.value || 0,
          newVote
        );
        return {
          ...oldPost,
          aura: oldPost.aura + voteChange,
          vote:
            newVote === 0 ? [] : [{ userId: 'currentUser', value: newVote }],
        };
      });
      return { previousState };
    },
    onSuccess: (_, newVote) => {
      const previousVote = data.userVote;
      if (newVote === 1 && previousVote === 1) {
        toast({
          description: `Amplified ${authorName}'s post`,
        });
      } else if (newVote === -1 && previousVote === -1) {
        toast({
          description: `Muted ${authorName}'s post`,
        });
      } else if (newVote === 1 && previousVote !== 1) {
        toast({
          description: `Removed amplification from ${authorName}'s post`,
        });
      } else if (newVote === -1 && previousVote !== -1) {
        toast({
          description: `Removed muting from ${authorName}'s post`,
        });
      }
    },
    onError(error, _variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: 'destructive',
        description: 'Something went wrong. Please try again.',
      });
    },
  });

  const calculateVoteChange = (oldVote: number, newVote: number): number => {
    if (oldVote === newVote) {
      return -oldVote; // Removing vote
    }
    if (oldVote === 0) {
      return newVote; // Adding new vote
    }
    return newVote - oldVote; // Changing vote
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        onClick={() => mutate(1)}
        className={cn(
          'group rounded-md p-1 text-muted-foreground hover:border hover:border-orange-500 hover:bg-orange-100 hover:bg-opacity-10 hover:shadow-md',
          data.userVote === 1 && 'bg-orange-100 bg-opacity-10'
        )}
      >
        <div className="flex items-center overflow-hidden hover:text-orange-500">
          <ArrowBigUp
            className={cn(
              'size-6',
              data.userVote === 1 && 'fill-orange-500 text-orange-500'
            )}
          />
          <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:ml-2 group-hover:max-w-xs">
            Amplify
          </span>
        </div>
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => mutate(-1)}
        className={cn(
          'group rounded-md p-1 text-muted-foreground hover:border hover:border-violet-500 hover:bg-violet-100 hover:bg-opacity-10 hover:shadow-md',
          data.userVote === -1 && 'bg-violet-100 bg-opacity-10'
        )}
      >
        <div className="flex items-center overflow-hidden hover:text-violet-500">
          <ArrowBigDown
            className={cn(
              'size-6',
              data.userVote === -1 && 'fill-violet-500 text-violet-500'
            )}
          />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-violet-500 transition-all duration-300 group-hover:ml-2 group-hover:max-w-xs">
            Mute
          </span>
        </div>
      </Button>
    </div>
  );
}
