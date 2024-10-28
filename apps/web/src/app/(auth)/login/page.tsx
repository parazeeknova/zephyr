import ClientLoginPage from "@/app/(auth)/client/ClientLoginPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login"
};

export default function LoginPage() {
  return <ClientLoginPage />;
}
