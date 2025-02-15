'use client';

import { HelpLink } from '@/components/Animations/ImageLinkPreview';
// @ts-expect-error - No types available for static assets
import HOME from '@assets/previews/home.png';
import { GitHub } from '@mui/icons-material';
import { Button } from '@zephyr/ui/shadui/button';
import { motion } from 'framer-motion';
import { AlertOctagon, Copy, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

// biome-ignore lint/suspicious/noShadowRestrictedNames: This is a custom error boundary component
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const errorDetails = {
    title: `[BUG]: Error report from ${pathname}`,
    body: `## Error Details
- **Page:** ${pathname}
- **Error Message:** ${error.message}
- **Error Stack:** \`\`\`\n${error.stack}\n\`\`\`
- **Time:** ${new Date().toISOString()}
- **Browser:** ${navigator.userAgent}
`,
  };

  const handleCopyError = async () => {
    await navigator.clipboard.writeText(
      `${errorDetails.title}\n\n${errorDetails.body}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateIssue = () => {
    const githubIssueURL = `https://github.com/parazeeknova/zephyr/issues/new?title=${encodeURIComponent(
      errorDetails.title
    )}&body=${encodeURIComponent(errorDetails.body)}`;
    window.open(githubIssueURL, '_blank');
  };

  const auroras = useMemo(() => {
    return new Array(6).fill(0).map((_, i) => ({
      width: 600 + Math.sin(i) * 400,
      height: 600 + Math.cos(i) * 400,
      top: `${(i * 25) % 100}%`,
      left: `${(i * 35) % 100}%`,
      delay: i * 0.8,
      duration: 8 + i * 3,
      opacity: 0.2 + Math.random() * 0.1,
    }));
  }, []);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4">
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-background/80" />

        {auroras.map((aurora, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: [aurora.opacity, aurora.opacity * 1.2, aurora.opacity],
              scale: [1, 1.1, 1],
              rotate: [0, 180, 0],
            }}
            transition={{
              duration: aurora.duration,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: aurora.delay,
            }}
            className="absolute rounded-full blur-[100px]"
            style={{
              width: `${aurora.width}px`,
              height: `${aurora.height}px`,
              top: aurora.top,
              left: aurora.left,
              background:
                i % 2 === 0
                  ? 'radial-gradient(circle at center, rgba(239,68,68,0.4), transparent 70%)'
                  : 'radial-gradient(circle at center, rgba(236,72,153,0.4), transparent 70%)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="relative mx-auto w-fit"
          >
            <AlertOctagon className="h-24 w-24 text-destructive/20" />
            <AlertOctagon className="absolute inset-0 h-24 w-24 animate-pulse text-destructive" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="font-bold text-4xl text-foreground tracking-tight">
              Something went wrong!
            </h1>
            <p className="text-lg text-muted-foreground">
              {error.message || 'An unexpected error occurred'}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 rounded-lg bg-muted/50 p-4">
                <pre className="overflow-auto text-left text-muted-foreground text-sm">
                  {error.stack}
                </pre>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap"
          >
            <Button
              onClick={reset}
              size="lg"
              className="group relative w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-destructive/50 to-destructive opacity-50 blur-lg transition-all group-hover:opacity-75" />
            </Button>

            <Button
              onClick={handleCopyError}
              size="lg"
              variant="outline"
              className="group relative w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy Error'}
              </span>
            </Button>

            <Button
              onClick={handleCreateIssue}
              size="lg"
              variant="outline"
              className="group relative w-full border-destructive/50 sm:w-auto"
            >
              <span className="relative z-10 flex items-center gap-2">
                <GitHub className="h-4 w-4" />
                Report on GitHub
              </span>
            </Button>

            <HelpLink href="/" text="Return Home ↗" previewImage={HOME.src} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-muted-foreground text-sm"
          >
            <p className="space-x-2">
              <span>Need help? You can:</span>
              <Link
                href="https://github.com/parazeeknova/zephyr/issues"
                target="_blank"
                className="text-primary hover:underline"
              >
                Open a GitHub issue
              </Link>
              <span>or</span>
              <Link
                href="mailto:zephyyrrnyx@gmail.com"
                className="text-primary hover:underline"
              >
                contact support
              </Link>
            </p>
            <p className="mt-2 text-xs">
              If this error persists, please report it to help us improve the
              platform.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
