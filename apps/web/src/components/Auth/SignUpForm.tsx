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
import { type SignUpValues, signUpSchema } from "@zephyr/auth/validation";
import { motion } from "framer-motion";
import { AlertCircle, Mail, User } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useCountdown } from "usehooks-ts";
import { Button } from "../ui/button";
import { PasswordStrengthChecker } from "./PasswordStrengthChecker";

export default function SignUpForm() {
  const { toast } = useToast();
  const { setIsVerifying } = useVerification();
  const verificationChannel = new BroadcastChannel("email-verification");
  const [count, { startCountdown, stopCountdown, resetCountdown }] =
    useCountdown({
      countStart: 60,
      intervalMs: 1000
    });

  useEffect(() => {
    if (count === 0) {
      stopCountdown();
      resetCountdown();
    }
  }, [count]);

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
  }, []);

  const texts = [
    "Elevate your ideas, accelerate your impact.",
    "Transform thoughts into action.",
    "Your journey to greatness starts here.",
    "Start Your Adventure",
    "Dive In!"
  ];

  const [error, setError] = useState<string>();
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [_isVerificationEmailSent, setIsVerificationEmailSent] =
    useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: ""
    }
  });

  const handleInvalidSubmit = () => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: firstError?.message ?? "Unknown error"
      });
    }
  };

  async function onSubmit(values: SignUpValues) {
    setError(undefined);
    startTransition(async () => {
      const { error, success } = await signUp(values);
      if (error) {
        setError(error);
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: error
        });
      } else if (success) {
        setIsVerifying(true);
        setIsVerificationEmailSent(true);
        startCountdown();
        toast({
          title: "Verification Email Sent",
          description: "Please check your email to verify your account."
        });
      }
    });
  }

  const onResendVerificationEmail = async () => {
    const email = form.getValues("email");
    const res = await resendVerificationEmail(email);

    if (res.error) {
      toast({
        variant: "destructive",
        description: res.error
      });
    } else if (res.success) {
      startCountdown();
      toast({
        title: "Email Resent",
        description: "Verification email has been resent to your inbox."
      });
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
        {/* Signup Form */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            _isVerificationEmailSent
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
                        <Input placeholder="Username" {...field} />
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
                        <Input placeholder="Email" type="email" {...field} />
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
                        placeholder="Password"
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
                loading={isPending}
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
            _isVerificationEmailSent
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
                  disabled={count > 0 && count < 60}
                  variant="ghost"
                  className="group relative w-full overflow-hidden rounded-lg border border-border/50 bg-background/50 transition-all hover:bg-background/80"
                >
                  {count > 0 && count < 60 ? (
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
