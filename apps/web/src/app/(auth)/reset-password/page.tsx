import ResetPasswordForm from '@/components/Auth/ResetPasswordForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
