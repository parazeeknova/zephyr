import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import loginImage from "@zephyr-assets/login-image.jpg";
import LoginForm from "@zephyr-ui/Auth/LoginForm";

export const metadata: Metadata = {
  title: "Login"
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen bg-background">
      <div className="-translate-y-1/2 absolute top-1/2 left-4 hidden lg:block">
        <h1 className="-rotate-90 transform whitespace-nowrap font-bold text-7xl text-primary opacity-25 lg:text-9xl">
          LOGIN
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="relative z-10 flex min-h-[600px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-card shadow-xl lg:flex-row">
          <div className="relative hidden w-1/2 bg-primary lg:block">
            <div className="relative h-full w-full">
              <Image
                src={loginImage}
                alt="Login illustration"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
          <div className="flex w-full flex-col justify-center p-6 sm:p-8 lg:w-1/2">
            <h2 className="mb-2 text-center font-bold text-3xl text-primary sm:mb-4 sm:text-4xl">
              Welcome Back
            </h2>
            <LoginForm />

            <div className="flex flex-col items-center justify-center">
              <Link
                href="/signup"
                className="text-primary text-sm hover:underline"
              >
                Don&apos;t have an account? Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute right-2 bottom-2 font-bold text-8xl text-primary opacity-50 sm:right-4 sm:bottom-4 sm:text-6xl">
        ZEPHYR.
      </div>
      <div
        className="absolute top-0 right-0 hidden h-full w-1/2 bg-center bg-cover opacity-10 lg:block"
        style={{ backgroundImage: `url(${loginImage.src})` }}
      />
    </div>
  );
}
