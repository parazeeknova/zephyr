'use client';

import AnimatedAuthLink from '@/components/Auth/AnimatedAuthLink';
import AuthButtonWrapper from '@/components/Auth/AuthButtonWrapper';
import LoginForm from '@/components/Auth/LoginForm';
// @ts-expect-error - no types for image files
import loginImage from '@assets/auth/login-image.jpg';
// @ts-expect-error - no types for image files
import signupImage from '@assets/previews/signup.png';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, FileText, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import DiscordSignInButton from './DiscordSignInButton';
import GithubSignInButton from './GithubSignInButton';
import GoogleSignInButton from './GoogleSignInButton';
import TwitterSignInButton from './TwitterSignInButton';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const slideIn = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      type: 'spring',
      stiffness: 100,
    },
  },
};

const scaleUp = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut',
      type: 'spring',
      stiffness: 100,
    },
  },
};

const contentAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.1,
      ease: 'easeOut',
    },
  }),
};

export const AnimatedZephyrText = () => {
  const letters = 'ZEPHYR.'.split('');

  return (
    <motion.div
      className="pointer-events-none fixed right-4 bottom-4 z-10 select-none font-bold text-4xl sm:text-6xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.7 }}
    >
      <div className="relative flex">
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            className="text-primary/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 1, 1, 0.3, 1],
              y: [20, 0, 0, 0, 0],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: i * 0.1,
              times: [0, 0.2, 0.5, 0.8, 1],
            }}
            style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              display: 'inline-block',
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>

      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-primary/30"
        initial={{ scaleX: 0 }}
        animate={{
          scaleX: [0, 1, 1, 1, 0],
          opacity: [0, 1, 1, 0.3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          times: [0, 0.2, 0.5, 0.8, 1],
        }}
        style={{ transformOrigin: 'left' }}
      />
    </motion.div>
  );
};

export default function ClientLoginPage() {
  return (
    <AnimatePresence>
      <motion.div
        className="relative flex min-h-screen overflow-hidden bg-background"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-background to-background/95" />

        <motion.div
          className="absolute left-20 hidden h-full items-center md:flex"
          variants={slideIn}
        >
          <div className="relative">
            <h1
              className="-rotate-90 absolute origin-center transform select-none whitespace-nowrap font-bold text-6xl text-primary/20 tracking-wider xl:text-8xl 2xl:text-9xl "
              style={{
                transformOrigin: 'center',
                left: '-50%',
                transform: 'translateX(-50%) translateY(-50%) rotate(-90deg)',
              }}
            >
              LOGIN
            </h1>
          </div>
        </motion.div>

        <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">
          <motion.div
            className="relative flex w-full max-w-5xl flex-col rounded-2xl border border-white/10 bg-card/40 shadow-2xl backdrop-blur-xl lg:flex-row"
            variants={scaleUp}
            whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            <div className="overflow-hidden rounded-l-2xl lg:w-1/2">
              <motion.div
                className="relative min-h-[200px] w-full bg-primary/80 lg:min-h-[850px]"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <motion.div
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
            </div>

            <div className="relative z-10 flex w-full flex-col justify-center px-6 py-12 sm:px-8 lg:w-1/2">
              <div className="mx-auto w-full max-w-sm">
                <motion.h2
                  className="mb-6 text-center font-bold text-3xl text-primary sm:text-4xl"
                  variants={contentAnimation}
                  custom={0}
                >
                  Welcome Back
                </motion.h2>

                <motion.div
                  className="mb-6 space-y-4"
                  variants={contentAnimation}
                  custom={1}
                >
                  <AuthButtonWrapper className="w-full">
                    <GoogleSignInButton />
                  </AuthButtonWrapper>

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
                  className="my-6 flex items-center gap-3"
                  variants={contentAnimation}
                  custom={2}
                >
                  <motion.div
                    className="h-px flex-1 bg-muted"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  <span className="px-2 text-muted-foreground text-sm">OR</span>
                  <motion.div
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
                  className="mt-6 text-center"
                  variants={contentAnimation}
                  custom={4}
                >
                  <AnimatedAuthLink
                    href="/signup"
                    text="Don't have an account? Sign Up"
                    previewImage={signupImage.src}
                  />
                </motion.div>
                <motion.div
                  variants={contentAnimation}
                  custom={5}
                  className="mt-8"
                >
                  <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/toc"
                        className="group flex flex-col gap-2 rounded-lg border border-primary/5 bg-background/80 p-3 transition-all hover:bg-accent hover:shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-1.5 transition-colors group-hover:bg-primary/20">
                            <FileText className="h-3 w-3 text-primary" />
                          </div>
                          <span className="font-medium text-foreground/80 text-xs transition-colors group-hover:text-primary">
                            Terms
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          Read our terms of service
                        </p>
                      </Link>

                      <Link
                        href="/privacy"
                        className="group flex flex-col gap-2 rounded-lg border border-primary/5 bg-background/80 p-3 transition-all hover:bg-accent hover:shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-1.5 transition-colors group-hover:bg-primary/20">
                            <Shield className="h-3 w-3 text-primary" />
                          </div>
                          <span className="font-medium text-foreground/80 text-xs transition-colors group-hover:text-primary">
                            Privacy
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          View our privacy policy
                        </p>
                      </Link>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-primary/5 border-t pt-3">
                      <p className="text-[10px] text-muted-foreground">
                        By signing in, you agree to our terms and privacy policy
                      </p>
                      <Link href="/privacy">
                        <motion.div
                          initial={{ scale: 0.95 }}
                          whileHover={{ scale: 1 }}
                          className="rounded-full bg-primary/10 p-1.5"
                        >
                          <ArrowRight className="h-3 w-3 text-primary" />
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="pointer-events-none fixed right-4 bottom-4 z-10 select-none font-bold text-4xl text-primary/50 sm:text-6xl">
          <AnimatedZephyrText />
        </div>

        <motion.div
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
