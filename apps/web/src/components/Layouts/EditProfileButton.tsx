'use client';

import EditProfileDialog from '@/components/Layouts/EditProfileDialog';
import { cn } from '@/lib/utils';
import type { UserData } from '@zephyr/db';
import { Button } from '@zephyr/ui/shadui/button';
import { useState } from 'react';

interface EditProfileButtonProps {
  user: UserData;
  className?: string;
}

export default function EditProfileButton({
  user,
  className,
}: EditProfileButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className={cn(
          'bg-primary font-medium font-sofiaProSoftMed text-background',
          className
        )}
      >
        Edit profile
      </Button>
      <EditProfileDialog
        user={user}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}
