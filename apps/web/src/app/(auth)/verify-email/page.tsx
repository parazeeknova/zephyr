"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ERROR_MESSAGES = {
  "invalid-token": "The verification link is invalid.",
  "token-expired": "The verification link has expired.",
  "verification-failed": "Email verification failed.",
  "server-error": "An error occurred. Please try again."
};

const VerificationAnimation = () => {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative h-32 w-64">
        {/* Email Icon */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          // @ts-expect-error
          className="absolute top-0 left-0 h-20 w-20 rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
          <svg
            className="h-full w-full text-primary/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </motion.div>

        {/* Verification Process Animation */}
        <motion.div
          // @ts-expect-error
          className="-translate-x-1/2 absolute top-8 left-1/2 h-1 w-20"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="h-full w-full bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
        </motion.div>

        {/* Shield Icon */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          // @ts-expect-error
          className="absolute top-0 right-0 h-20 w-20 rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
          <svg
            className="h-full w-full text-primary/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </motion.div>

        {/* Scanning Effect */}
        <motion.div
          // @ts-expect-error
          className="absolute top-0 left-0 h-full w-1 bg-primary/50"
          initial={{ x: 0 }}
          animate={{ x: 256 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear"
          }}
        />
      </div>

      {/* Verification Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // @ts-expect-error
        className="text-center"
      >
        <motion.p
          // @ts-expect-error
          className="font-medium text-foreground text-lg"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          Verifying your email...
        </motion.p>
        <motion.p
          // @ts-expect-error
          className="mt-2 text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Please wait while we confirm your identity
        </motion.p>
      </motion.div>

      {/* Progress Dots */}
      {/* @ts-expect-error */}
      <motion.div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            // @ts-expect-error
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

const AnimatedZephyrText = () => {
  const letters = "ZEPHYR.".split("");

  return (
    <motion.div
      // @ts-expect-error
      className="pointer-events-none select-none font-bold text-4xl sm:text-6xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.7 }}
    >
      <div className="relative flex">
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            // @ts-expect-error
            className="text-primary/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 1, 1, 0.3, 1],
              y: [20, 0, 0, 0, 0]
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.1,
              times: [0, 0.2, 0.5, 0.8, 1]
            }}
            style={{
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              display: "inline-block"
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>
      <motion.div
        // @ts-expect-error
        className="absolute bottom-0 left-0 h-0.5 bg-primary/30"
        initial={{ scaleX: 0 }}
        animate={{
          scaleX: [0, 1, 1, 1, 0],
          opacity: [0, 1, 1, 0.3, 0]
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 0.8, 1]
        }}
        style={{ transformOrigin: "left" }}
      />
    </motion.div>
  );
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const error = searchParams.get("error");
    const token = searchParams.get("token");
    const verified = searchParams.get("verified");

    if (verified) {
      router.push("/?verified=true");
      return;
    }

    if (error) {
      setStatus("error");
    } else if (token) {
      window.location.href = `/api/verify-email?token=${token}`;
    } else {
      setStatus("error");
    }
  }, [searchParams, router]);

  const error = searchParams.get("error");
  const errorMessage = error
    ? ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES]
    : "Invalid verification link";

  return (
    <AnimatePresence>
      <motion.div
        // @ts-expect-error
        className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background/95 to-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background blur elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="-left-4 absolute top-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
          <div className="-translate-x-1/2 absolute bottom-0 left-1/2 h-[300px] w-[300px] rounded-full bg-pink-500/10 blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            // @ts-expect-error
            className="w-full max-w-md rounded-lg border border-border/50 bg-background/60 p-8 shadow-lg backdrop-blur-xl"
          >
            {status === "loading" && <VerificationAnimation />}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                // @ts-expect-error
                className="flex flex-col items-center space-y-4"
              >
                <XCircle className="h-16 w-16 text-destructive" />
                <h2 className="text-center font-bold text-2xl text-foreground">
                  Verification Failed
                </h2>
                <p className="text-center text-muted-foreground">
                  {errorMessage}
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="mt-4 w-full"
                >
                  Back to Login
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Animated Zephyr Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            // @ts-expect-error
            className="-translate-x-1/2 absolute bottom-8 left-1/2"
          >
            <AnimatedZephyrText />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
