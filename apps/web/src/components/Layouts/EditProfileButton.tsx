"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EditProfileDialog from "@zephyr-ui/Layouts/EditProfileDialog";
import type { UserData } from "@zephyr/db";
import { useState } from "react";

interface EditProfileButtonProps {
  user: UserData;
  className?: string;
}

export default function EditProfileButton({
  user,
  className
}: EditProfileButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className={cn(
          "bg-primary font-medium font-sofiaProSoftMed text-background",
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
