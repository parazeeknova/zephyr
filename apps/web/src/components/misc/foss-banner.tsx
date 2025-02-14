import { GitPullRequest } from 'lucide-react';
import Link from 'next/link';

interface FossBannerProps {
  className?: string;
}

export function FossBanner({ className }: FossBannerProps) {
  return (
    <div
      className={`mt-12 rounded-lg border border-primary/10 bg-primary/5 p-4 ${className}`}
    >
      <div className="mb-2 flex items-center gap-2 text-primary">
        <GitPullRequest className="h-5 w-5" />
        <h3 className="font-semibold">Open Source Project</h3>
      </div>
      <p className="text-muted-foreground text-sm">
        Zephyr is a Free and Open Source Software (FOSS) project. We welcome
        contributions and suggestions to improve our platform. Visit our{' '}
        <Link
          href="https://github.com/parazeeknova/zephyr"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          GitHub repository
        </Link>{' '}
        to contribute or provide feedback on our policies and documentation.
      </p>
    </div>
  );
}
