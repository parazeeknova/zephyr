import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import kyInstance from "@/lib/ky";
import { cn } from "@/lib/utils";
import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import type { VoteInfo } from "@zephyr/db";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";

interface AuraVoteButtonProps {
  postId: string;
  initialState: VoteInfo;
  authorName: string;
}

export default function AuraVoteButton({
  postId,
  initialState,
  authorName
}: AuraVoteButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["vote-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/votes`).json<VoteInfo>(),
    initialData: initialState,
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true // Refetch when window regains focus
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
        if (!old) return old;
        const voteChange = calculateVoteChange(old.userVote, newVote);
        return {
          aura: old.aura + voteChange,
          userVote: newVote === old.userVote ? 0 : newVote
        };
      });

      // Update the post data in the cache
      queryClient.setQueryData(["post", postId], (oldPost: any) => {
        if (!oldPost) return oldPost;
        const voteChange = calculateVoteChange(
          oldPost.vote[0]?.value || 0,
          newVote
        );
        return {
          ...oldPost,
          aura: oldPost.aura + voteChange,
          vote: newVote === 0 ? [] : [{ userId: "currentUser", value: newVote }]
        };
      });
      return { previousState };
    },
    onSuccess: (_, newVote) => {
      const previousVote = data.userVote;
      if (newVote === 1 && previousVote === 1) {
        toast({
          description: `Amplified ${authorName}'s post`
        });
      } else if (newVote === -1 && previousVote === -1) {
        toast({
          description: `Muted ${authorName}'s post`
        });
      } else if (newVote === 1 && previousVote !== 1) {
        toast({
          description: `Removed amplification from ${authorName}'s post`
        });
      } else if (newVote === -1 && previousVote !== -1) {
        toast({
          description: `Removed muting from ${authorName}'s post`
        });
      }
    },
    onError(error, _variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again."
      });
    }
  });

  const calculateVoteChange = (oldVote: number, newVote: number): number => {
    if (oldVote === newVote) return -oldVote; // Removing vote
    if (oldVote === 0) return newVote; // Adding new vote
    return newVote - oldVote; // Changing vote
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        onClick={() => mutate(1)}
        className={cn(
          "mr-1 rounded-md p-1 text-muted-foreground hover:border hover:border-border hover:bg-green-100",
          data.userVote === 1 && "bg-green-100"
        )}
      >
        <ArrowBigUp
          className={cn(
            "mr-1 size-6",
            data.userVote === 1 && "fill-green-500 text-green-500"
          )}
        />
        <div className="mr-1 text-sm">Amplify</div>
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => mutate(-1)}
        className={cn(
          "mr-1 rounded-md p-1 text-muted-foreground hover:border hover:border-border hover:bg-red-100",
          data.userVote === -1 && "bg-red-100"
        )}
      >
        <ArrowBigDown
          className={cn(
            "mr-1 size-6",
            data.userVote === -1 && "fill-red-500 text-red-500"
          )}
        />
        <div className="mr-1 text-sm">Mute</div>
      </Button>
    </div>
  );
}
