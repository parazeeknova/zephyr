'use client';

import PostEditor from '@/components/Posts/editor/PostEditor';
import { motion } from 'framer-motion';

export default function PostEditorPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      <div className="-z-10 absolute inset-0 bg-gradient-to-b from-primary/5 via-background/50 to-background blur-3xl" />
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        <PostEditor />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-5 rounded-2xl border border-border bg-card/30 p-5 backdrop-blur-sm"
      >
        <h3 className="font-semibold text-lg">Tips for great posts:</h3>
        <ul className="mt-3 list-disc pl-5 text-muted-foreground">
          <li>Add relevant media to make your post more engaging</li>
          <li>Use clear and concise language</li>
          <li>Share your unique perspective</li>
          <li>Engage with the community by asking questions</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
