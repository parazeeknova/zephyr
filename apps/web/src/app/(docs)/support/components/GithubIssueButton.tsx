import { Button } from '@/components/ui/button';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';

export function GithubIssueButton() {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        variant="outline"
        className="w-full gap-2 bg-background/50 backdrop-blur-sm"
        asChild
      >
        <a
          href="https://github.com/parazeeknova/zephyr/issues/new/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubLogoIcon className="h-4 w-4" />
          Report Issue on GitHub
        </a>
      </Button>
    </motion.div>
  );
}
