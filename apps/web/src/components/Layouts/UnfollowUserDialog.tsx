import LoadingButton from '@/components/Auth/LoadingButton';
import { useUnfollowUserMutation } from '@/hooks/userMutations';
import { useQueryClient } from '@tanstack/react-query';
import type { UserData } from '@zephyr/db';
import { Button } from '@zephyr/ui/shadui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zephyr/ui/shadui/dialog';
import { useState } from 'react';

interface UnfollowUserDialogProps {
  user: UserData;
  open: boolean;
  onClose: () => void;
}

export default function UnfollowUserDialog({
  user,
  open,
  onClose,
}: UnfollowUserDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useUnfollowUserMutation();
  const [isUnfollowing, setIsUnfollowing] = useState(false);

  function handleOpenChange(open: boolean) {
    if (!open || (!mutation.isPending && !isUnfollowing)) {
      onClose();
    }
  }

  const handleUnfollow = () => {
    setIsUnfollowing(true);

    // Optimistic update
    queryClient.setQueryData<UserData[]>(['followed-users'], (old) =>
      (old || []).filter((u) => u.id !== user.id)
    );

    mutation.mutate(user.id, {
      onSuccess: () => {
        // The optimistic update is already done, so we just close the dialog
        onClose();
      },
      onError: () => {
        // Revert the optimistic update if there's an error
        queryClient.invalidateQueries({ queryKey: ['followed-users'] });
      },
      onSettled: () => {
        setIsUnfollowing(false);
      },
    });

    // Close the dialog immediately for a snappier feel
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unfollow User</DialogTitle>
          <DialogDescription>
            Are you sure you want to unfollow {user.displayName}? You can always
            follow them again later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <LoadingButton
            variant="destructive"
            onClick={handleUnfollow}
            loading={isUnfollowing}
          >
            Unfollow
          </LoadingButton>
          <Button variant="outline" onClick={onClose} disabled={isUnfollowing}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
