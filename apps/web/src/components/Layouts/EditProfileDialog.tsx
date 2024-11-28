import { useUpdateAvatarMutation } from "@/app/(main)/users/[username]/avatar-mutations";
import avatarPlaceholder from "@/app/assets/avatar-placeholder.png";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingButton from "@zephyr-ui/Auth/LoadingButton";
import {
  type UpdateUserProfileValues,
  updateUserProfileSchema
} from "@zephyr/auth/validation";
import type { UserData } from "@zephyr/db";
import { Camera } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import Resizer from "react-image-file-resizer";
import CropImageDialog from "./CropImageDialog";
import GifCenteringDialog from "./GifCenteringDialog";

interface EditProfileDialogProps {
  user: UserData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileDialog({
  user,
  open,
  onOpenChange
}: EditProfileDialogProps) {
  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio || ""
    }
  });

  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const mutation = useUpdateAvatarMutation();

  async function onSubmit(_values: UpdateUserProfileValues) {
    if (croppedAvatar) {
      const file = new File([croppedAvatar], `avatar_${user.id}.webp`, {
        type: "image/webp"
      });

      await mutation.mutateAsync({
        file,
        userId: user.id,
        oldAvatarKey: user.avatarKey || undefined
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Avatar</Label>
          <AvatarInput
            src={
              croppedAvatar
                ? URL.createObjectURL(croppedAvatar)
                : user.avatarUrl || avatarPlaceholder
            }
            onImageCropped={setCroppedAvatar}
            form={form}
            isUploading={mutation.isPending}
            user={user}
          />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface AvatarInputProps {
  src: string | StaticImageData;
  onImageCropped: (blob: Blob | null) => void;
  form: UseFormReturn<UpdateUserProfileValues>;
  isUploading: boolean;
  user: UserData;
}

function AvatarInput({
  src,
  onImageCropped,
  form,
  isUploading,
  user
}: AvatarInputProps) {
  const [imageToCrop, setImageToCrop] = useState<File>();
  const [gifToCenter, setGifToCenter] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onImageSelected(file: File | undefined) {
    if (!file) return;

    if (file.type === "image/gif") {
      setGifToCenter(file);
      return;
    }

    Resizer.imageFileResizer(
      file,
      1024,
      1024,
      "WEBP",
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      "file"
    );
  }

  return (
    <>
      <input
        type="file"
        accept="image/*, image/gif"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        className="sr-only hidden"
      />
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative block"
          disabled={isUploading}
        >
          <Image
            src={src}
            alt="Avatar preview"
            width={150}
            height={150}
            className={cn(
              "size-32 flex-none rounded-full object-cover",
              isUploading && "opacity-50"
            )}
            unoptimized={typeof src === "string" && src.endsWith(".gif")}
          />
          <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black bg-opacity-30 text-white transition-colors duration-200 group-hover:bg-opacity-25">
            {isUploading ? (
              <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Camera size={24} />
            )}
          </span>
        </button>
        <p className="text-muted-foreground text-xs">
          Supports JPG, PNG, and GIF (under 8MB)
        </p>
      </div>

      {gifToCenter && (
        <GifCenteringDialog
          gifFile={gifToCenter}
          onClose={() => {
            setGifToCenter(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
          currentValues={{
            displayName: form.getValues("displayName"),
            bio: form.getValues("bio"),
            userId: user.id,
            oldAvatarKey: user.avatarKey || undefined
          }}
        />
      )}

      {imageToCrop && (
        <CropImageDialog
          src={URL.createObjectURL(imageToCrop)}
          cropAspectRatio={1}
          onCropped={(blob) => {
            if (blob) {
              onImageCropped(blob);
            }
          }}
          onClose={() => {
            setImageToCrop(undefined);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />
      )}
    </>
  );
}
