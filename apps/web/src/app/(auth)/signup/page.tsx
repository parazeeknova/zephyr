import ClientSignupPage from '@/app/(auth)/client/ClientSignUpPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default function SignupPage() {
  return <ClientSignupPage />;
}
