import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
});

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: z.infer<typeof usernameSchema>) => {
      const response = await fetch("/api/users/username", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update username");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    }
  });
}

export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: z.infer<typeof emailSchema>) => {
      const response = await fetch("/api/users/email", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update email");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    }
  });
}
