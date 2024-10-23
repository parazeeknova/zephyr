import { validateRequest } from "@zephyr/auth/auth";
import { redirect } from "next/navigation";
import Navbar from "./Navbar";
import SessionProvider from "./SessionProvider";

export default async function Layout({
  children
}: { children: React.ReactNode }) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      <Navbar />
      <div className="flex flex-1 flex-col font-sofiaProSoft">{children}</div>
    </SessionProvider>
  );
}
