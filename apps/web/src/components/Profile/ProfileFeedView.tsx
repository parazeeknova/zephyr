'use client';

import { useQuery } from '@tanstack/react-query';
import type { UserData } from '@zephyr/db';
import { useToast } from '@zephyr/ui/hooks/use-toast';
import { Card } from '@zephyr/ui/shadui/card';
import { Skeleton } from '@zephyr/ui/shadui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@zephyr/ui/shadui/tabs';
import { motion } from 'framer-motion';
import { AtSignIcon, FileTextIcon } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../misc/ErrorBoundary';
import MentionedPosts from './MentionedPosts';
import UserPosts from './UserPost';
import UserDetails from './sidebars/right/UserDetails';

interface ProfileFeedViewProps {
  username: string;
  userData: UserData;
  loggedInUserId: string;
}

const ProfileFeedView: React.FC<ProfileFeedViewProps> = ({
  userData: initialUserData,
  loggedInUserId,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('posts');

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user', initialUserData.id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/users/${initialUserData.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      } catch (_err) {
        toast({
          title: 'Error',
          description: 'Failed to load user data. Using cached data.',
          variant: 'destructive',
        });
        return initialUserData;
      }
    },
    initialData: initialUserData,
    staleTime: 1000 * 60,
    retry: 2,
  });

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !userData) {
    return <div>Error loading profile</div>;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex-1 bg-background p-4 text-foreground md:p-8">
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mt-2 mb-10 md:hidden">
            <UserDetails userData={userData} loggedInUserId={loggedInUserId} />
          </div>

          <div className="hidden md:block">
            <ProfileHeader userData={userData} />
          </div>

          <Card className="mb-8 overflow-hidden bg-card shadow-lg">
            <div className="p-4">
              <Tabs
                defaultValue="posts"
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <div className="mb-6 flex justify-center">
                  <TabsList className="relative flex gap-2 rounded-full border bg-muted/30 p-0 shadow-inner shadow-white/5 ring-1 ring-white/10 backdrop-blur-xl dark:shadow-black/10 dark:ring-black/20">
                    <div
                      className="-z-10 absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-30 blur-md"
                      style={{
                        background:
                          'radial-gradient(circle at top left, rgba(var(--primary-rgb), 0.15), transparent 70%), radial-gradient(circle at bottom right, rgba(var(--accent-rgb), 0.15), transparent 70%)',
                      }}
                    />
                    <TabsTrigger
                      value="posts"
                      className="group relative flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-sm transition-all duration-300 ease-out hover:bg-background/50 data-[state=active]:scale-105 data-[state=active]:text-primary"
                    >
                      <span className="absolute inset-0 rounded-full bg-background/0 shadow-none transition-all duration-300 group-data-[state=active]:bg-background group-data-[state=active]:shadow-md group-data-[state=active]:shadow-primary/10" />
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="relative">
                          <FileTextIcon className="h-4 w-4 transition-all duration-300 group-data-[state=active]:text-primary" />
                          <span className="absolute inset-0 rounded-full bg-primary/20 opacity-0 blur-sm transition-opacity group-hover:opacity-30 group-data-[state=active]:opacity-50" />
                        </span>
                        <span className="transition-all duration-300 group-data-[state=active]:font-semibold">
                          Posts
                        </span>
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="mentions"
                      className="group relative flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-sm transition-all duration-300 ease-out hover:bg-background/50 data-[state=active]:scale-105 data-[state=active]:text-primary"
                    >
                      <span className="absolute inset-0 rounded-full bg-background/0 shadow-none transition-all duration-300 group-data-[state=active]:bg-background group-data-[state=active]:shadow-md group-data-[state=active]:shadow-primary/10" />
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="relative">
                          <AtSignIcon className="h-4 w-4 transition-all duration-300 group-data-[state=active]:text-primary" />
                          <span className="absolute inset-0 rounded-full bg-primary/20 opacity-0 blur-sm transition-opacity group-hover:opacity-30 group-data-[state=active]:opacity-50" />
                        </span>
                        <span className="transition-all duration-300 group-data-[state=active]:font-semibold">
                          Mentions
                        </span>
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="posts"
                  className={activeTab === 'posts' ? 'block' : 'hidden'}
                >
                  <motion.div
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    key="posts-tab"
                  >
                    <UserPosts userId={userData.id} filter="all" />
                  </motion.div>
                </TabsContent>

                <TabsContent
                  value="mentions"
                  className={activeTab === 'mentions' ? 'block' : 'hidden'}
                >
                  <motion.div
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    key="mentions-tab"
                  >
                    <MentionedPosts userId={userData.id} />
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          <div className="mb-16 md:hidden">
            <ProfileHeader userData={userData} />
          </div>
        </motion.main>
      </div>
    </ErrorBoundary>
  );
};

export default ProfileFeedView;

const ProfileHeader: React.FC<{ userData: UserData }> = ({ userData }) => {
  const { data: avatarData } = useQuery({
    queryKey: ['avatar', userData?.id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/users/avatar/${userData?.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch avatar');
        }
        return response.json();
      } catch (_error) {
        return {
          url: userData?.avatarUrl,
          key: userData?.avatarKey,
        };
      }
    },
    initialData: {
      url: userData?.avatarUrl,
      key: userData?.avatarKey,
    },
    enabled: !!userData?.id,
    staleTime: 1000 * 60 * 5,
  });

  if (!userData) {
    return null;
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative h-32"
      >
        <div className="absolute inset-0">
          <div
            className="h-full w-full bg-center bg-cover"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url(${avatarData?.url})`,
              filter: 'blur(8px)',
              transform: 'scale(1.1)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="relative flex h-full items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-bold text-2xl text-white uppercase drop-shadow-md">
              {userData.displayName}'s Profile
            </h1>
            <p className="mt-1 text-muted-foreground">
              You are viewing {userData.displayName}'s content
            </p>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};

const ProfileSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-20 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);
