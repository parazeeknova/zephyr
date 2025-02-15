import Chat from '@/components/Messages/Chat';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whispers',
  description: 'Zephyr Whispers',
};

export default function Page() {
  return <Chat />;
}
