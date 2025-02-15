'use client';

import { requestPasswordReset } from '@/app/(auth)/reset-password/server-actions';
import { LoadingButton } from '@/components/Auth/LoadingButton';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { motion } from 'framer-motion';
import { KeyRound, Mail } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof emailSchema>;

interface SecuritySettingsProps {
  user: UserData;
}

export default function SecuritySettings({ user }: SecuritySettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user.email || '',
    },
  });

  // biome-ignore lint/suspicious/useAwait: This is a React Hook Form function
  async function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await requestPasswordReset(values);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
        return;
      }

      setIsEmailSent(true);
      toast({
        title: 'Email Sent',
        description: 'Check your email for password reset instructions',
      });
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="relative overflow-hidden rounded-lg border border-border/50 bg-background/30 p-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-medium text-lg text-transparent">
              Security Settings
            </h2>
            <p className="text-muted-foreground text-sm">
              Manage your account security
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Change Password</h3>
          </div>

          <div className="relative rounded-md border border-border/50 bg-background/20 p-6 backdrop-blur-sm">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          disabled={isEmailSent}
                          placeholder="Enter your email to reset password"
                          className="bg-background/50 backdrop-blur-sm transition-all duration-200 hover:bg-background/70 focus:bg-background/70"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <LoadingButton
                  type="submit"
                  loading={isPending}
                  disabled={isEmailSent}
                  className="w-full sm:w-auto"
                >
                  {isEmailSent ? 'Email Sent' : 'Send Reset Link'}
                </LoadingButton>
              </form>
            </Form>

            <div className="-z-10 absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background blur-xl" />
          </div>
        </motion.div>

        <div className="-z-20 absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background blur-3xl" />
      </div>
    </motion.div>
  );
}
