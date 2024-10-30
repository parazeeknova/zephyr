import { cn } from "@/lib/utils";
import avatarPlaceholder from "@zephyr-assets/avatar-placeholder.png";
import Image from "next/image";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
  priority?: boolean;
}

export default function UserAvatar({
  avatarUrl,
  size,
  className,
  priority = false
}: UserAvatarProps) {
  return (
    <Image
      src={avatarUrl || avatarPlaceholder}
      alt="User avatar"
      width={size ?? 48}
      height={size ?? 48}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className
      )}
      priority={priority}
      unoptimized={avatarUrl?.endsWith(".gif")} // Don't optimize GIFs to keep animation
    />
  );
}
