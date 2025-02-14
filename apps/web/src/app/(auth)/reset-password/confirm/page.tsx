import ConfirmResetForm from '@zephyr-ui/Auth/ConfirmResetForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Your Password',
};

export default function ConfirmResetPage() {
  return <ConfirmResetForm />;
}
