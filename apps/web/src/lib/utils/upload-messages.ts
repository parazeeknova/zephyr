import type { FileTypeConfig } from "./mime-utils";

export const uploadToasts = {
  canceled: () => ({
    title: "Upload Canceled",
    description: "File upload was canceled",
    variant: "default" as const
  }),

  started: (filename: string) => ({
    title: "Upload Started",
    description: `Uploading ${filename}...`,
    variant: "default" as const
  }),

  sizeError: (size: string, category: string) => ({
    title: "File Too Large",
    description: `File size must be less than ${size} for ${category} files`,
    variant: "destructive" as const
  }),

  typeError: () => ({
    title: "Unsupported File Type",
    description: "This file type is not supported",
    variant: "destructive" as const
  }),
  avatarSuccess: () => ({
    title: "Avatar Updated",
    description: "Your profile picture has been updated successfully",
    variant: "success" as const
  }),

  avatarError: (error: string) => ({
    title: "Avatar Update Failed",
    description: error,
    variant: "destructive" as const
  }),

  progress: (filename: string, progress: number) => ({
    title: "Uploading...",
    description: `Uploading ${filename}: ${Math.round(progress)}%`,
    variant: "default" as const
  }),

  success: (filename: string, category: FileTypeConfig["category"]) => ({
    title: "Upload Successful",
    description: `Successfully uploaded ${filename} as ${category.toLowerCase()}`,
    variant: "success" as const
  }),

  error: (error: string) => ({
    title: "Upload Failed",
    description: `Error: ${error}. Please try again.`,
    variant: "destructive" as const
  }),

  validationError: (message: string) => ({
    title: "Validation Failed",
    description: message,
    variant: "destructive" as const
  }),

  networkError: () => ({
    title: "Network Error",
    description: "Please check your internet connection and try again",
    variant: "destructive" as const
  })
};
