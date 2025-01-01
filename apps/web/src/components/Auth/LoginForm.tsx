"use client";
import { login } from "@/app/(auth)/login/actions";
import { resendVerificationEmail } from "@/app/(auth)/signup/actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import ForgotPasswordLink from "@zephyr-ui/Auth/ForgotPasswordLink";
import { LoadingButton } from "@zephyr-ui/Auth/LoadingButton";
import { PasswordInput } from "@zephyr-ui/Auth/PasswordInput";
import { type LoginValues, loginSchema } from "@zephyr/auth/validation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Mail, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

export default function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>();
  const [isVerificationEmailSent, setIsVerificationEmailSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [shake, setShake] = useState(false);
  const [errorFields, setErrorFields] = useState<{
    username?: boolean;
    password?: boolean;
  }>({});

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  useEffect(() => {
    const subscription = form.watch(() => {
      if (Object.keys(errorFields).length > 0) {
        setErrorFields({});
      }
    });
    return () => subscription.unsubscribe();
  }, [form, errorFields]);

  async function onSubmit(values: LoginValues) {
    setError(undefined);
    setUnverifiedEmail(undefined);
    setIsVerificationEmailSent(false);
    setErrorFields({});

    startTransition(async () => {
      try {
        const result = await login(values);

        if (result.error) {
          setError(result.error);
          setShake(true);
          if (result.error.includes("Incorrect username or password")) {
            setErrorFields({ username: true, password: true });
          }
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                {result.error}
              </div>
            ),
            duration: 5000
          });
        } else if (result.emailVerification) {
          setUnverifiedEmail(result.emailVerification.email);
          if (result.emailVerification.isNewToken) {
            setIsVerificationEmailSent(true);
            toast({
              title: "Verification Required",
              description:
                "Please check your inbox for the verification email.",
              duration: 5000
            });
          }
        } else if (result.success) {
          toast({
            title: "Welcome Back!",
            description: "Successfully logged in to your account.",
            duration: 3000
          });
          router.refresh();
          router.push("/");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "An unexpected error occurred. Please try again.",
          duration: 5000
        });
      }
    });
  }

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;

    try {
      const result = await resendVerificationEmail(unverifiedEmail);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: result.error,
          duration: 5000
        });
      } else if (result.success) {
        toast({
          title: "Verification Email Sent",
          description: "Please check your inbox to verify your email address.",
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "An unexpected error occurred. Please try again.",
        duration: 5000
      });
    }
  };

  return (
    <Form {...form}>
      <motion.div
        animate={shake ? "shake" : "stable"}
        variants={{
          shake: {
            x: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.5 }
          },
          stable: { x: 0 }
        }}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-lg bg-destructive/15 p-3 text-center text-destructive text-sm"
              >
                <p className="flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {unverifiedEmail && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-sm"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-md" />
                  <div className="relative rounded-full border border-primary/20 bg-background/80 p-3 backdrop-blur-sm">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <p className="font-medium text-foreground">
                    Email Verification Required
                  </p>
                  <p className="text-muted-foreground">
                    {isVerificationEmailSent
                      ? `We've sent a verification email to ${unverifiedEmail}`
                      : "Your email address needs to be verified to continue."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="group relative w-full"
                >
                  <div className="-inset-0.5 absolute rounded-lg bg-primary opacity-10 blur transition group-hover:opacity-20" />
                  <div className="relative flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-background/80 px-4 py-2 text-primary transition-colors hover:bg-background/90">
                    <Mail className="h-4 w-4" />
                    <span>
                      {isVerificationEmailSent
                        ? "Resend verification email"
                        : "Send verification email"}
                    </span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Username"
                      {...field}
                      className={`transition-all duration-200 ${
                        errorFields.username
                          ? "border-destructive/50 bg-destructive/10"
                          : ""
                      }`}
                    />
                    {errorFields.username && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="-translate-y-1/2 absolute top-1/2 right-3"
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </motion.div>
                    )}
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
                  <div className="relative">
                    <PasswordInput
                      placeholder="Password"
                      {...field}
                      className={`transition-all duration-200 ${
                        errorFields.password
                          ? "border-destructive/50 bg-destructive/10"
                          : ""
                      }`}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end">
            <ForgotPasswordLink />
            <p className="px-2 text-muted-foreground">or</p>
            <Link href="/support">
              <p className="text-muted-foreground text-sm transition-colors hover:text-primary">
                Need help?
              </p>
            </Link>
          </div>

          <LoadingButton loading={isPending} type="submit" className="w-full">
            Log in
          </LoadingButton>
        </form>
      </motion.div>
    </Form>
  );
}
