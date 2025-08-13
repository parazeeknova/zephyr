import { LoadingButton } from '@/components/Auth/LoadingButton';
import type { UserData } from '@zephyr/db';
import { useToast } from '@zephyr/ui/hooks/use-toast';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface LinkedAccountsProps {
  user: UserData;
  onLink: (provider: string) => void;
}

export default function LinkedAccounts({ user, onLink }: LinkedAccountsProps) {
  const { toast } = useToast();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleLink = (provider: string) => {
    setLoadingProvider(provider);
    onLink(provider);
  };

  const handleUnlink = async (provider: string) => {
    setLoadingProvider(provider);
    try {
      const response = await fetch(`/api/auth/unlink/${provider}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unlink account');
      }

      toast({
        title: 'Account unlinked',
        description: `Your ${provider} account has been unlinked successfully`,
      });

      window.location.reload();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  const AccountCard = ({
    provider,
    icon,
    isConnected,
    isComingSoon = false,
  }: {
    provider: string;
    icon: string;
    isConnected?: boolean;
    isComingSoon?: boolean;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden rounded-lg border border-border/50 p-4 backdrop-blur-xs transition-colors ${
        isComingSoon ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-background/50 p-2">
            <Image
              src={`/${icon}.svg`}
              alt={provider}
              width={24}
              height={24}
              className="size-6"
            />
          </div>
          <div>
            <p className="font-medium">{provider}</p>
            <p className="text-muted-foreground text-sm">
              {isComingSoon
                ? 'Coming soon'
                : // biome-ignore lint/nursery/noNestedTernary: ignore
                  isConnected
                  ? 'Connected'
                  : 'Not connected'}
            </p>
          </div>
        </div>
        <LoadingButton
          variant={isConnected ? 'destructive' : 'default'}
          onClick={() =>
            isConnected
              ? handleUnlink(icon.toLowerCase())
              : handleLink(icon.toLowerCase())
          }
          disabled={isComingSoon}
          loading={loadingProvider === icon.toLowerCase()}
          className="relative overflow-hidden transition-all duration-200"
        >
          {isComingSoon
            ? 'Coming Soon'
            : // biome-ignore lint/nursery/noNestedTernary: ignore
              isConnected
              ? 'Disconnect'
              : 'Connect'}
        </LoadingButton>
      </div>
      <div className="-z-10 absolute inset-0 animate-gradient bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <h3 className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-medium text-transparent">
          Linked Accounts
        </h3>
      </div>
      <motion.div className="grid gap-4 sm:grid-cols-2">
        <AccountCard
          provider="Google"
          icon="google"
          isConnected={!!user.googleId}
        />
        <AccountCard
          provider="GitHub"
          icon="github"
          isConnected={!!user.githubId}
        />
        <AccountCard
          provider="Discord"
          icon="discord"
          isConnected={!!user.discordId}
        />
        <AccountCard
          provider="Twitter"
          icon="twitter"
          isConnected={!!user.twitterId}
        />
      </motion.div>
    </motion.div>
  );
}
