import { LoadingButton } from "@/components/Auth/LoadingButton";
import type { UserData } from "@zephyr/db";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface LinkedAccountsProps {
  user: UserData;
  onLink: (provider: string) => void;
}

export default function LinkedAccounts({ user, onLink }: LinkedAccountsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleLink = (provider: string) => {
    setLoadingProvider(provider);
    onLink(provider);
  };

  const AccountCard = ({
    provider,
    icon,
    isConnected,
    isComingSoon = false
  }: {
    provider: string;
    icon: string;
    isConnected?: boolean;
    isComingSoon?: boolean;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      // @ts-expect-error
      className={`relative overflow-hidden rounded-lg border p-4 backdrop-blur-sm transition-colors ${
        isComingSoon ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex size-8 items-center justify-center">
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
                ? "Coming soon"
                : isConnected
                  ? "Connected"
                  : "Not connected"}
            </p>
          </div>
        </div>
        <LoadingButton
          variant={isConnected ? "outline" : "default"}
          onClick={() => handleLink(icon.toLowerCase())}
          disabled={isConnected || isComingSoon}
          loading={loadingProvider === icon.toLowerCase()}
          className="relative overflow-hidden"
        >
          {isComingSoon ? "Coming Soon" : isConnected ? "Connected" : "Connect"}
        </LoadingButton>
      </div>

      {/* Gradient border animation */}
      <div className="-z-10 absolute inset-0 animate-gradient bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Linked Accounts</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <AccountCard
          provider="Google"
          icon="google"
          isConnected={!!user.googleId}
        />
        <AccountCard provider="GitHub" icon="github" isComingSoon />
        <AccountCard provider="Discord" icon="discord" isComingSoon />
        <AccountCard provider="Twitter" icon="twitter" isComingSoon />
      </div>
    </div>
  );
}
