'use client';

import { GitHub } from '@mui/icons-material';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { Button } from '@zephyr/ui/shadui/button';
import { motion } from 'framer-motion';
import { ChevronRight, Code2, GitPullRequest, Star } from 'lucide-react';
import Link from 'next/link';

interface ContributeCardProps {
  isCollapsed: boolean;
}

export default function ContributeCard({ isCollapsed }: ContributeCardProps) {
  if (isCollapsed) {
    return (
      <div className="rounded-xl border bg-card p-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-auto w-full p-2"
          asChild
        >
          <Link
            href="https://github.com/parazeeknova/zephyr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHub className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2 text-primary">
          <GitPullRequest className="h-5 w-5" />
          <h3 className="font-semibold">Contribute to Zephyr</h3>
        </div>

        <p className="text-muted-foreground text-sm">
          Help us make Zephyr better! We welcome all contributions.
        </p>

        <div className="space-y-2">
          <Link
            href="https://github.com/parazeeknova/zephyr"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-2">
              <GitHubLogoIcon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="font-medium text-sm">Repository</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>

          <Link
            href="https://github.com/parazeeknova/zephyr/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="font-medium text-sm">Issues</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          // @ts-expect-error
          className="border-t pt-2"
        >
          <Button variant="outline" size="sm" className="w-full gap-2" asChild>
            <Link
              href="https://github.com/parazeeknova/zephyr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Star className="h-4 w-4" />
              Star on GitHub
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
