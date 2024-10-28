"use client";

import { signUp } from "@/app/(auth)/signup/actions";
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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoadingButton } from "@zephyr-ui/Auth/LoadingButton";
import { PasswordInput } from "@zephyr-ui/Auth/PasswordInput";
import { type SignUpValues, signUpSchema } from "@zephyr/auth/validation";
import { AlertCircle, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { PasswordStrengthChecker } from "./PasswordStrengthChecker";

export default function SignUpForm() {
  const { toast } = useToast();
  const router = useRouter();

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

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: ""
    }
  });

  async function onSubmit(values: SignUpValues) {
    setError(undefined);
    startTransition(async () => {
      console.log("Submitting signup form with values:", {
        ...values,
        password: "[REDACTED]"
      });

      const { error, success } = await signUp(values);
      if (error) {
        console.log("Signup error:", error);
        setError(error);
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: error
        });
      } else if (success) {
        console.log("Signup successful");
        toast({
          title: "Account Created Successfully",
          description: "Welcome to Zephyr! Redirecting to home page..."
        });

        // Only redirect if signup was successful
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      }
    });
  }

  // Show validation errors as toasts
  const handleInvalidSubmit = () => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: firstError.message
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
          <LoadingButton loading={isPending} type="submit" className="w-full">
            Create account
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
}
