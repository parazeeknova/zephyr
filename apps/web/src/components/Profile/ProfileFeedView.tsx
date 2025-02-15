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
import type React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../misc/ErrorBoundary';
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

  const tabConfig = [
    { value: 'all', label: 'All' },
    { value: 'scribbles', label: 'Fleets' },
    { value: 'snapshots', label: 'Snapshots' },
    { value: 'media', label: 'Reels' },
    { value: 'files', label: 'Wisps' },
  ];

  if (isLoading) {
    return <ProfileSkeleton />;
  }
  if (error || !userData) {
    return <div>Error loading profile</div>;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex-1 overflow-auto bg-background p-4 text-foreground md:p-8">
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

          <Card className="mb-8 bg-card shadow-lg">
            <div className="p-4">
              <Tabs defaultValue="all" className="w-full">
                <div className="mb-4 flex justify-center sm:mb-6">
                  <TabsList className="grid w-full max-w-2xl grid-cols-5">
                    {tabConfig.map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {tabConfig.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <UserPosts
                        userId={userData.id}
                        filter={
                          tab.value as
                            | 'all'
                            | 'scribbles'
                            | 'snapshots'
                            | 'media'
                            | 'files'
                        }
                      />
                    </motion.div>
                  </TabsContent>
                ))}
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
              You are viewing {userData.displayName}'s fleets.
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
