"use client";

import AuthButtonWrapper from "@/components/Auth/AuthButtonWrapper";
import loginImage from "@zephyr-assets/login-image.jpg";
import LoginForm from "@zephyr-ui/Auth/LoginForm";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import DiscordSignInButton from "./DiscordSignInButton";
import GithubSignInButton from "./GithubSignInButton";
import GoogleSignInButton from "./GoogleSignInButton";
import TwitterSignInButton from "./TwitterSignInButton";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const slideIn = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      type: "spring",
      stiffness: 100
    }
  }
};

const scaleUp = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      type: "spring",
      stiffness: 100
    }
  }
};

const contentAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.1,
      ease: "easeOut"
    }
  })
};

const AnimatedZephyrText = () => {
  const letters = "ZEPHYR.".split("");

  return (
    <motion.div
      // @ts-expect-error
      className="pointer-events-none fixed right-4 bottom-4 z-10 select-none font-bold text-4xl sm:text-6xl"
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

      {/* Animated underline */}
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

export default function ClientLoginPage() {
  return (
    <AnimatePresence>
      <motion.div
        // @ts-expect-error
        className="relative flex min-h-screen overflow-hidden bg-background"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-background to-background/95" />

        {/* Login Text - Most precise positioning */}
        <motion.div
          // @ts-expect-error
          className="absolute left-20 hidden h-full items-center md:flex"
          variants={slideIn}
        >
          <div className="relative">
            <h1
              className="-rotate-90 absolute origin-center transform select-none whitespace-nowrap font-bold text-6xl text-primary/20 tracking-wider xl:text-8xl 2xl:text-9xl "
              style={{
                transformOrigin: "center",
                left: "-50%",
                transform: "translateX(-50%) translateY(-50%) rotate(-90deg)"
              }}
            >
              LOGIN
            </h1>
          </div>
        </motion.div>

        <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">
          <motion.div
            // @ts-expect-error
            className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/40 shadow-2xl backdrop-blur-xl lg:flex-row"
            variants={scaleUp}
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          >
            <motion.div
              // @ts-expect-error
              className="relative min-h-[200px] w-full bg-primary/80 lg:min-h-[600px] lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                // @ts-expect-error
                className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              />
              <Image
                src={loginImage}
                alt="Login illustration"
                fill
                priority
                className="object-cover brightness-95"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>

            <div className="relative z-10 flex w-full flex-col justify-center px-6 py-12 sm:px-8 lg:w-1/2">
              <div className="mx-auto w-full max-w-sm">
                <motion.h2
                  // @ts-expect-error
                  className="mb-6 text-center font-bold text-3xl text-primary sm:text-4xl"
                  variants={contentAnimation}
                  custom={0}
                >
                  Welcome Back
                </motion.h2>

                <motion.div
                  // @ts-expect-error
                  className="mb-6 space-y-4"
                  variants={contentAnimation}
                  custom={1}
                >
                  {/* Google button - full width */}
                  <AuthButtonWrapper className="w-full">
                    <GoogleSignInButton />
                  </AuthButtonWrapper>

                  {/* Grid for other auth buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <AuthButtonWrapper>
                      <GithubSignInButton />
                    </AuthButtonWrapper>

                    <AuthButtonWrapper>
                      <DiscordSignInButton />
                    </AuthButtonWrapper>

                    <AuthButtonWrapper>
                      <TwitterSignInButton />
                    </AuthButtonWrapper>
                  </div>
                </motion.div>

                <motion.div
                  // @ts-expect-error
                  className="my-6 flex items-center gap-3"
                  variants={contentAnimation}
                  custom={2}
                >
                  <motion.div
                    // @ts-expect-error
                    className="h-px flex-1 bg-muted"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  <span className="px-2 text-muted-foreground text-sm">OR</span>
                  <motion.div
                    // @ts-expect-error
                    className="h-px flex-1 bg-muted"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </motion.div>

                <motion.div variants={contentAnimation} custom={3}>
                  <LoginForm />
                </motion.div>

                <motion.div
                  // @ts-expect-error
                  className="mt-6 text-center"
                  variants={contentAnimation}
                  custom={4}
                >
                  <Link
                    href="/signup"
                    className="group relative inline-block text-primary text-sm"
                  >
                    <span className="relative z-10">
                      Don&apos;t have an account? Sign Up
                    </span>
                    <motion.span
                      // @ts-expect-error
                      className="absolute bottom-0 left-0 h-0.5 w-full bg-primary/40"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="pointer-events-none fixed right-4 bottom-4 z-10 select-none font-bold text-4xl text-primary/50 sm:text-6xl">
          <AnimatedZephyrText />
        </div>

        {/* Background image for both mobile and desktop */}
        <motion.div
          // @ts-expect-error
          className="absolute top-0 right-0 h-full w-full bg-center bg-cover opacity-5 blur-md lg:w-1/2"
          style={{ backgroundImage: `url(${loginImage.src})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 1 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
