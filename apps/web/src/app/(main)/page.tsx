// In page.tsx
import { validateRequest } from "@zephyr/auth/auth";
import { getUserDataSelect, prisma } from "@zephyr/db";
import ClientHome from "./ClientHome";

export default async function Page() {
  const { user } = await validateRequest();

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  // Fetch the complete user data with all required fields
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: getUserDataSelect(user.id)
  });

  if (!userData) {
    return <p className="text-destructive">Unable to load user data.</p>;
  }

  return <ClientHome userData={userData} />;
}
