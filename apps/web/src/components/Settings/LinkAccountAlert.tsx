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
        github_account_linked_other:
          "This GitHub account is already linked to another user",
        discord_account_linked_other:
          "This Discord account is already linked to another user",
        already_linked: "This account is already linked to your account",
        twitter_account_linked_other:
          "This Twitter account is already linked to another user",
        twitter_auth_failed: "Twitter authentication failed. Please try again",
        email_mismatch: "The account email doesn't match your account email",
        google_auth_failed: "Google authentication failed. Please try again",
        github_auth_failed: "GitHub authentication failed. Please try again",
        discord_auth_failed: "Discord authentication failed. Please try again",
        unauthorized: "You must be logged in to link accounts",
        cannot_unlink_no_email:
          "Cannot unlink: No email associated with account",
        cannot_unlink_no_password:
          "Cannot unlink: Need at least one authentication method",
        unknown_error: "An unexpected error occurred. Please try again"
      };

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessages[error] || "An error occurred"
      });
    }

    if (success) {
      const successMessages: Record<string, string> = {
        google_linked: "Google account linked successfully",
        google_unlinked: "Google account unlinked successfully",
        github_linked: "GitHub account linked successfully",
        github_unlinked: "GitHub account unlinked successfully",
        twitter_linked: "Twitter account linked successfully",
        twitter_unlinked: "Twitter account unlinked successfully",
        discord_linked: "Discord account linked successfully",
        discord_unlinked: "Discord account unlinked successfully"
      };

      toast({
        title: "Success",
        description: successMessages[success] || "Operation successful"
      });
    }
  }, [searchParams, toast]);

  return null;
}
