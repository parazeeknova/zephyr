"use client";

import { resendVerificationEmail, signUp } from "@/app/(auth)/signup/actions";
import { FlipWords } from "@/components/ui/flip-words";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useVerification } from "@/context/VerificationContext";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@zephyr-ui/Auth/LoadingButton";
import { PasswordInput } from "@zephyr-ui/Auth/PasswordInput";
import { isDevelopmentMode } from "@zephyr/auth/src/email/service";
import { type SignUpValues, signUpSchema } from "@zephyr/auth/validation";
import { motion } from "framer-motion";
import { AlertCircle, Mail, User } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  type FieldValues,
  type SubmitErrorHandler,
  useForm
} from "react-hook-form";
import { useCountdown } from "usehooks-ts";
import { Button } from "../ui/button";
import { PasswordStrengthChecker } from "./PasswordStrengthChecker";

const texts = [
  "Elevate your ideas, accelerate your impact.",
  "Transform thoughts into action.",
  "Your journey to greatness starts here.",
  "Start Your Adventure",
  "Dive In!"
];

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

export default function SignUpForm() {
  const { toast } = useToast();
  const { setIsVerifying } = useVerification();
  const [error, setError] = useState<string>();
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerificationEmailSent, setIsVerificationEmailSent] = useState(false);
  const verificationChannel = new BroadcastChannel("email-verification");

  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: 60,
      intervalMs: 1000
    });

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: ""
    },
    mode: "onBlur"
  });

  useEffect(() => {
    if (count === 0) {
      stopCountdown();
      resetCountdown();
    }
  }, [count, stopCountdown, resetCountdown]);

  useEffect(() => {
    const handleVerificationSuccess = () => {
      setIsVerifying(false);
      window.location.reload();
    };

    verificationChannel.addEventListener("message", (event) => {
      if (event.data === "verification-success") {
        handleVerificationSuccess();
      }
    });

    return () => {
      verificationChannel.close();
    };
  }, [setIsVerifying]);

  const handleInvalidSubmit: SubmitErrorHandler<FieldValues> = useCallback(
    (errors) => {
      const firstError = Object.values(errors)[0];
      const errorMessage =
        (firstError?.message as string) || "Please check your input";

      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: errorMessage,
        duration: 3000
      });

      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        scrollToError(firstErrorField);
      }
    },
    [toast]
  );

  const onSubmit = async (values: SignUpValues) => {
    setError(undefined);
    startTransition(async () => {
      try {
        setIsLoading(true);
        const result = await signUp(values);

        if (result.success) {
          if (result.skipVerification) {
            toast({
              title: "Account Created",
              description: isDevelopmentMode()
                ? "Development mode: Email verification skipped"
                : "Account created successfully",
              duration: 3000
            });

            form.reset();

            if (isDevelopmentMode()) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            window.location.href = "/";
          } else {
            setIsVerifying(true);
            setIsVerificationEmailSent(true);
            startCountdown();
            toast({
              title: "Verification Required",
              description: "Please check your email to verify your account."
            });

            if (isDevelopmentMode() && result.verificationUrl) {
              console.info(
                "Development Mode - Verification URL:",
                result.verificationUrl
              );
            }
          }
        } else if (result.error) {
          setError(result.error);
          toast({
            variant: "destructive",
            title: "Signup Failed",
            description: result.error
          });
        }
      } catch (error) {
        const errorMessage = toErrorWithMessage(error).message;
        console.error("Signup error:", error);
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: isDevelopmentMode()
            ? errorMessage
            : "An unexpected error occurred"
        });
      } finally {
        setIsLoading(false);
      }
    });
  };

  const onResendVerificationEmail = async () => {
    if (count > 0 && count < 60) return;

    try {
      setIsResending(true);
      const email = form.getValues("email");
      const result = await resendVerificationEmail(email);

      if (result.success) {
        startCountdown();
        toast({
          title: "Email Sent",
          description: "A new verification email has been sent.",
          duration: 3000
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Resend",
          description: result.error || "Failed to resend verification email",
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend verification email. Please try again."
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center text-sm">
        <FlipWords
          className="font-semibold text-gray-500 sm:text-base"
          words={texts}
        />
      </div>

      <div className="relative">
        <div
          className={`transition-all duration-500 ease-in-out ${
            isVerificationEmailSent
              ? "pointer-events-none translate-y-[-20px] transform opacity-0"
              : "translate-y-0 transform opacity-100"
          }`}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, handleInvalidSubmit)}
              className="space-y-3"
            >
              {error && (
                <div className="rounded-lg bg-destructive/15 p-3 text-center text-destructive text-sm">
                  <p className="flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                </div>
              )}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="cooluser" {...field} />
                        <User className="-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="you@example.com"
                          type="email"
                          {...field}
                        />
                        <Mail className="-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setPassword(e.target.value);
                        }}
                      />
                    </FormControl>
                    <PasswordStrengthChecker password={password} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <LoadingButton
                loading={isPending || isLoading}
                type="submit"
                className="w-full"
              >
                Create account
              </LoadingButton>
            </form>
          </Form>
        </div>

        {/* Verification Message */}
        <div
          className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out ${
            isVerificationEmailSent
              ? "translate-y-0 transform opacity-100"
              : "pointer-events-none translate-y-[20px] transform opacity-0"
          }`}
        >
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-background/60 p-8 shadow-lg backdrop-blur-xl">
            {/* Background Effects */}
            <div className="-z-10 absolute inset-0 overflow-hidden">
              <div className="-left-4 absolute top-0 h-[200px] w-[200px] rounded-full bg-primary/10 blur-[50px]" />
              <div className="absolute top-1/2 right-0 h-[150px] w-[150px] rounded-full bg-purple-500/10 blur-[50px]" />
            </div>

            <div className="flex flex-col items-center space-y-6 text-center">
              {/* Icon Container */}
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-md" />
                <div className="relative rounded-full border border-primary/20 bg-background/80 p-4 backdrop-blur-sm">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>

              {/* Title with gradient */}
              <div className="space-y-2">
                <h3 className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text font-bold text-2xl text-transparent">
                  Check Your Email
                </h3>
                <div className="mx-auto h-1 w-12 rounded-full bg-gradient-to-r from-primary/5 via-primary/60 to-primary/5" />
              </div>

              {/* Email Info */}
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  We've sent a verification link to
                </p>
                <p className="rounded-lg border border-border/50 bg-muted/50 px-4 py-2 font-medium text-foreground">
                  {form.getValues("email")}
                </p>
                <p className="text-muted-foreground text-sm">
                  Please check your inbox to complete your registration
                </p>
              </div>

              {/* Resend Section */}
              <div className="w-full space-y-4 pt-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-border/30 border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background/60 px-2 text-muted-foreground backdrop-blur-sm">
                      Didn't receive the email?
                    </span>
                  </div>
                </div>

                <Button
                  onClick={onResendVerificationEmail}
                  disabled={isResending || (count > 0 && count < 60)}
                  variant="ghost"
                  className="group relative w-full overflow-hidden rounded-lg border border-border/50 bg-background/50 transition-all hover:bg-background/80"
                >
                  {isResending ? (
                    <span className="relative text-muted-foreground">
                      Sending...
                    </span>
                  ) : count > 0 && count < 60 ? (
                    <>
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-primary/10"
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: count, ease: "linear" }}
                      />
                      <span className="relative text-muted-foreground">
                        Resend available in {count}s
                      </span>
                    </>
                  ) : (
                    <span className="relative text-primary">
                      Resend verification email
                    </span>
                  )}
                </Button>

                <p className="text-center text-muted-foreground text-xs">
                  Check your spam folder if you don't see the email in your
                  inbox
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function scrollToError(fieldName: string) {
  requestAnimationFrame(() => {
    const element = document.querySelector(`[name="${fieldName}"]`);
    element?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });
}
