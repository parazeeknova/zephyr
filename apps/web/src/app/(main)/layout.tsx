import { redirect } from "next/navigation";

import { validateRequest } from "@zephyr/auth/auth";
import SessionProvider from "./SessionProvider";

export default async function Layout({
  children
}: { children: React.ReactNode }) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      <div className="flex h-screen flex-col font-custom">{children}</div>
    </SessionProvider>
  );
}
