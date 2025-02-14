import { validateRequest } from '@zephyr/auth/auth';
import { redirect } from 'next/navigation';

export default async function Layout({
  children,
}: { children: React.ReactNode }) {
  const { user } = await validateRequest();

  if (user) redirect('/');

  return (
    <>
      <div className="font-sofiaProSoftMed">{children}</div>
    </>
  );
}
