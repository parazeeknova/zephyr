"use client";

import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import resetImage from "@zephyr-assets/password-reset-image.jpg";
import { requestPasswordReset } from "@zephyr/auth/reset-password/server-actions";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "../ui/form";
import { Input } from "../ui/input";
import { LoadingButton } from "./LoadingButton";

const schema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type FormValues = z.infer<typeof schema>;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut"
    }
  }
};

export default function ResetPasswordForm() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: ""
    },
    mode: "onChange"
  });

  async function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const result = await requestPasswordReset(values);

        if (result.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.error
          });
          return;
        }

        setIsEmailSent(true);
        toast({
          title: "Check Your Email",
          description:
            "If an account exists, you'll receive password reset instructions."
        });
      } catch (_error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send reset email. Please try again."
        });
      }
    });
  }

  const ResetAnimation = () => {
    return (
      // @ts-expect-error
      <motion.div className="relative mx-auto mb-8 h-24 w-24">
        {/* Outer rotating circle */}
        <motion.div
          // @ts-expect-error
          className="absolute inset-0 rounded-full border-4 border-blue-400/20"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 8,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY
          }}
        />

        {/* Inner rotating circle */}
        <motion.div
          // @ts-expect-error
          className="absolute inset-2 rounded-full border-4 border-blue-400/30"
          animate={{
            rotate: -360
          }}
          transition={{
            duration: 4,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY
          }}
        />

        {/* Center icon */}
        <motion.div
          // @ts-expect-error
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY
          }}
        >
          <div className="rounded-full bg-blue-400/10 p-4 backdrop-blur-sm">
            <KeyRound className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            // @ts-expect-error
            className="absolute h-2 w-2 rounded-full bg-blue-400"
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: [0, Math.cos((i * Math.PI * 2) / 3) * 50],
              y: [0, Math.sin((i * Math.PI * 2) / 3) * 50],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: i * 0.6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        // @ts-expect-error
        className="relative flex min-h-screen overflow-hidden bg-background"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Background gradient overlay - updated with blue */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-400/5 via-background to-background/95" />

        {/* Reset Text - updated color */}
        <motion.div
          // @ts-expect-error
          className="absolute right-20 hidden h-full items-center md:flex"
          variants={itemVariants}
        >
          <div className="relative">
            <h1
              className="absolute origin-center rotate-90 transform select-none whitespace-nowrap font-bold text-6xl text-blue-400/20 tracking-wider xl:text-8xl 2xl:text-9xl"
              style={{
                transformOrigin: "center",
                right: "-50%",
                transform: "translateX(50%) translateY(-50%) rotate(90deg)"
              }}
            >
              RESET
            </h1>
          </div>
        </motion.div>

        <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">
          <motion.div
            // @ts-expect-error
            className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/40 shadow-2xl backdrop-blur-xl lg:flex-row"
            variants={itemVariants}
            whileHover={{
              boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)"
            }}
          >
            <div className="relative z-10 flex w-full flex-col justify-center px-6 py-12 sm:px-8 lg:w-1/2">
              <motion.div
                variants={itemVariants}
                // @ts-expect-error
                className="mx-auto w-full max-w-sm"
              >
                <Link
                  href="/login"
                  className="mb-8 inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-blue-400"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>

                {/* Add the reset animation here */}
                <ResetAnimation />

                <motion.h2
                  // @ts-expect-error
                  className="mb-6 text-center font-bold text-3xl text-blue-400 sm:text-4xl"
                  variants={itemVariants}
                >
                  Reset Password
                </motion.h2>

                <AnimatePresence mode="wait">
                  {isEmailSent ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      // @ts-expect-error
                      className="text-center"
                    >
                      <motion.div
                        // @ts-expect-error
                        className="mb-6 inline-block"
                        variants={floatAnimation}
                        initial="initial"
                        animate="animate"
                      >
                        <div className="rounded-full bg-blue-400/10 p-4">
                          <Mail className="h-8 w-8 text-blue-400" />
                        </div>
                      </motion.div>
                      <h3 className="mb-2 font-semibold text-xl">
                        Check Your Email
                      </h3>
                      <p className="text-muted-foreground">
                        If an account exists for that email, you'll receive
                        password reset instructions.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
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
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type="email"
                                      placeholder="Enter your email"
                                      className="pr-10 focus-visible:ring-blue-400"
                                      value={field.value ?? ""}
                                    />
                                    <Mail className="-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 text-muted-foreground" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <LoadingButton
                            loading={isPending}
                            type="submit"
                            className="w-full bg-blue-400 hover:bg-blue-500"
                          >
                            Send Reset Link
                          </LoadingButton>
                        </form>
                      </Form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Image section with blue overlay */}
            <motion.div
              // @ts-expect-error
              className="relative min-h-[200px] w-full bg-blue-400/80 lg:min-h-[600px] lg:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                // @ts-expect-error
                className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-400/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              />
              <Image
                src={resetImage}
                alt="Reset password illustration"
                fill
                priority
                className="object-cover brightness-95"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Background image with blue tint */}
        <motion.div
          // @ts-expect-error
          className="absolute top-0 left-0 h-full w-full bg-center bg-cover opacity-5 blur-md lg:w-1/2"
          style={{
            backgroundImage: `url(${resetImage.src})`,
            backgroundColor: "rgba(96, 165, 250, 0.1)"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 1 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
