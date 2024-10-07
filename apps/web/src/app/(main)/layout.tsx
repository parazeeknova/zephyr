import { redirect } from "next/navigation";

import Header from "@zephyr-ui/Layouts/Header";
import { validateRequest } from "@zephyr/auth/auth";
import SessionProvider from "./SessionProvider";

export default async function Layout({
  children
}: { children: React.ReactNode }) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      <Header />
      <div className="flex h-screen flex-col font-sofiaProSoft">{children}</div>
    </SessionProvider>
  );
}
