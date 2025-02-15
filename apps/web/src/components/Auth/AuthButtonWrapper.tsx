import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AuthButtonWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function AuthButtonWrapper({
  children,
  className = '',
}: AuthButtonWrapperProps) {
  return (
    <motion.div
      className="mb-3 w-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
      }}
    >
      <div
        className={`group relative overflow-hidden rounded-lg backdrop-blur-md ${className}`}
      >
        <div className="absolute inset-0 opacity-25 transition-opacity group-hover:opacity-50">
          <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50" />
        </div>
        <div className="relative bg-background/50 p-[1px] transition-colors group-hover:bg-background/70">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
