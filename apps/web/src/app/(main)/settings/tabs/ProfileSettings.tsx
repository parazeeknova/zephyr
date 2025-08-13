'use client';

import { LoadingButton } from '@/components/Auth/LoadingButton';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type UpdateUserProfileValues,
  updateUserProfileSchema,
} from '@zephyr/auth/validation';
import type { UserData } from '@zephyr/db';
import { useToast } from '@zephyr/ui/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@zephyr/ui/shadui/form';
import { Input } from '@zephyr/ui/shadui/input';
import { Textarea } from '@zephyr/ui/shadui/textarea';
import { motion } from 'framer-motion';
import { UserCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUpdateProfileMutation } from '../../users/[username]/avatar-mutations';

interface ProfileSettingsProps {
  user: UserData;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const { toast } = useToast();
  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio || '',
    },
  });

  const mutation = useUpdateProfileMutation();

  async function onSubmit(values: UpdateUserProfileValues) {
    mutation.mutate(
      {
        values,
        userId: user.id,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Profile updated',
            description: 'Your profile has been updated successfully',
          });
        },
      }
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      // @ts-expect-error
      className="space-y-6"
    >
      <div className="relative overflow-hidden rounded-lg border border-border/50 bg-background/30 p-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <UserCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-medium text-lg text-transparent">
              Profile Information
            </h2>
            <p className="text-muted-foreground text-sm">
              Update your profile information
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background/50 backdrop-blur-xs transition-all duration-200 hover:bg-background/70 focus:bg-background/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell us about yourself"
                        className="min-h-[120px] resize-none bg-background/50 backdrop-blur-xs transition-all duration-200 hover:bg-background/70 focus:bg-background/70"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              // @ts-expect-error
              className="pt-2"
            >
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                className="w-full sm:w-auto"
              >
                Save Changes
              </LoadingButton>
            </motion.div>
          </form>
        </Form>

        {/* Gradient background effect */}
        <div className="-z-10 absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background blur-3xl" />
      </div>
    </motion.div>
  );
}
