"use client";

import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LinkAccountAlert() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (error) {
      const errorMessages: Record<string, string> = {
        google_account_linked_other:
          "This Google account is already linked to another user",
        already_linked: "This Google account is already linked to your account",
        email_mismatch:
          "The Google account email doesn't match your account email",
        google_auth_failed: "Google authentication failed. Please try again",
        unauthorized: "You must be logged in to link accounts",
        unknown_error: "An unexpected error occurred. Please try again"
      };

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessages[error] || "An error occurred"
      });
    }

    if (success === "google_linked") {
      toast({
        title: "Success",
        description: "Google account linked successfully"
      });
    }
  }, [searchParams, toast]);

  return null;
}
