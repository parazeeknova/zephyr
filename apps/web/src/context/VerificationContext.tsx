"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface VerificationContextType {
  isVerifying: boolean;
  setIsVerifying: (state: boolean) => void;
  verificationChannel: BroadcastChannel | null;
}

const VerificationContext = createContext<VerificationContextType | undefined>(
  undefined
);

export function VerificationProvider({
  children
}: { children: React.ReactNode }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationChannel, setVerificationChannel] =
    useState<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel("email-verification");
    setVerificationChannel(channel);

    return () => {
      channel.close();
    };
  }, []);

  return (
    <VerificationContext.Provider
      value={{
        isVerifying,
        setIsVerifying,
        verificationChannel
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error(
      "useVerification must be used within a VerificationProvider"
    );
  }
  return context;
};
