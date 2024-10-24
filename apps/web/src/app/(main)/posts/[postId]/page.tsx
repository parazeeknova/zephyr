import NavigationCard from "@/components/Home/sidebars/left/NavigationCard";
import Linkify from "@/helpers/global/Linkify";
import PostCard from "@zephyr-ui/Home/feedview/postCard";
import FollowButton from "@zephyr-ui/Layouts/FollowButton";
import StickyFooter from "@zephyr-ui/Layouts/StinkyFooter";
import UserAvatar from "@zephyr-ui/Layouts/UserAvatar";
import UserTooltip from "@zephyr-ui/Layouts/UserTooltip";
import { validateRequest } from "@zephyr/auth/auth";
import { type UserData, getPostDataInclude, prisma } from "@zephyr/db";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";

interface PageProps {
  params: Promise<{ postId: string }>;
}

const getPost = cache(async (postId: string, loggedInUser: string) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId
    },
    include: getPostDataInclude(loggedInUser)
  });

  if (!post) notFound();

  return post;
});

export async function generateMetadata(props: PageProps) {
  const params = await props.params;

  const { postId } = params;

  const { user } = await validateRequest();

  if (!user) return {};

  const post = await getPost(postId, user.id);

  return {
    title: `${post.user.displayName}: ${post.content.slice(0, 50)}...`
  };
}

export default async function Page(props: PageProps) {
  const params = await props.params;

  const { postId } = params;

  const { user } = await validateRequest();

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not logged in. Please log in to view this page.
      </p>
    );
  }

  const post = await getPost(postId, user.id);

  return (
    <>
      <main className="flex w-full min-w-0 gap-5">
        <aside className="ml-1 w-64 flex-shrink-0">
          <NavigationCard
            isCollapsed={false}
            className="h-[calc(100vh-4.5rem)]"
            stickyTop="5rem"
          />
        </aside>
        <div className="mt-5 w-full min-w-0 space-y-5">
          <PostCard post={post} />
        </div>
        <div className="sticky top-[5.25rem] hidden h-fit w-80 flex-none lg:block">
          <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
            <UserInfoSidebar user={post.user} />
          </Suspense>
          <div className="mt-4">
            <StickyFooter />
          </div>
        </div>
      </main>
    </>
  );
}

interface UserInfoSidebarProps {
  user: UserData;
}

async function UserInfoSidebar({ user }: UserInfoSidebarProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return null;

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="font-bold text-xl">About this user</div>
      <UserTooltip user={user}>
        <Link
          href={`/users/${user.username}`}
          className="flex items-center gap-3"
        >
          <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
          <div>
            <p className="line-clamp-1 break-all font-semibold font-sofiaProSoftBold hover:underline">
              {user.displayName}
            </p>
            <p className="line-clamp-1 break-all text-muted-foreground">
              @{user.username}
            </p>
          </div>
        </Link>
      </UserTooltip>
      <Linkify>
        <div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground">
          {user.bio}
        </div>
      </Linkify>
      {user.id !== loggedInUser.id && (
        <FollowButton
          userId={user.id}
          initialState={{
            followers: user._count.followers,
            isFollowedByUser: user.followers.some(
              ({ followerId }) => followerId === loggedInUser.id
            )
          }}
        />
      )}
    </div>
  );
}
