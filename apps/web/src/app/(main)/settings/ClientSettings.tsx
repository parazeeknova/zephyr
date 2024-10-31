"use client";

import { AnimatedZephyrText } from "@/app/(auth)/client/ClientLoginPage";
import { LegalLinksCard } from "@/components/misc/LegalLinksCard";
import { FossBanner } from "@/components/misc/foss-banner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserData } from "@zephyr/db";
import { motion } from "framer-motion";
import AccountSettings from "./tabs/AccountSettings";
import ProfileSettings from "./tabs/ProfileSettings";
import SecuritySettings from "./tabs/SecuritySettings";

interface ClientSettingsProps {
  user: UserData;
}

export default function ClientSettings({ user }: ClientSettingsProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-start justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        // @ts-expect-error
        className="container max-w-4xl px-4 py-8 md:px-8 md:py-12 lg:py-16"
      >
        <h1 className="mb-10 bg-gradient-to-r from-primary to-secondary bg-clip-text text-center font-bold text-2xl text-transparent md:text-3xl lg:text-4xl">
          Settings
        </h1>

        <div className="relative mx-auto rounded-xl border border-border/50 bg-background/30 p-4 shadow-lg backdrop-blur-lg sm:p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 w-full justify-start bg-background/50 backdrop-blur-md">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-primary/20"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="data-[state=active]:bg-primary/20"
              >
                Account
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-primary/20"
              >
                Security
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-6">
              <TabsContent
                value="profile"
                className="focus-visible:outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProfileSettings user={user} />
                </motion.div>
              </TabsContent>

              <TabsContent
                value="account"
                className="focus-visible:outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AccountSettings user={user} />
                </motion.div>
              </TabsContent>

              <TabsContent
                value="security"
                className="focus-visible:outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <SecuritySettings user={user} />
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>

          <LegalLinksCard className="mt-8" />
          <FossBanner className="mt-8" />

          {/* Background gradient effect */}
          <div className="-z-10 absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-secondary/5 to-background blur-3xl" />
        </div>
      </motion.div>
      <div className="hidden md:block">
        <AnimatedZephyrText />
      </div>
    </div>
  );
}
