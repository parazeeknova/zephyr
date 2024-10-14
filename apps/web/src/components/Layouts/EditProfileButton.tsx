"use client";

import { Button } from "@/components/ui/button";
import EditProfileDialog from "@zephyr-ui/Layouts/EditProfileDialog";
import type { UserData } from "@zephyr/db";
import { useState } from "react";

interface EditProfileButtonProps {
  user: UserData;
}

export default function EditProfileButton({ user }: EditProfileButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className="bg-primary font-medium font-sofiaProSoftMed text-background"
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
