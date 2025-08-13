'use client';

import { getRandomFact } from '@/components/Constants/loading-facts';
import { GooeyText } from '@zephyr/ui/components/ui/gooey-text-morphing';
import { SpiralAnimation } from '@zephyr/ui/components/ui/spiral-animation';
import { Button } from '@zephyr/ui/shadui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Loading() {
  const [funFact, setFunFact] = useState('');
  const [showHomeLink, setShowHomeLink] = useState(false);

  useEffect(() => {
    const updateFunFact = () => setFunFact(getRandomFact());
    updateFunFact();
    const interval = setInterval(updateFunFact, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowHomeLink(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>

      <div className="relative flex min-h-screen w-full flex-col items-center justify-center">
        <div className="relative z-10 flex flex-col items-center justify-center space-y-16">
          <GooeyText
            texts={['Loading', 'लोडिंग', '積載中', 'Carregando', 'Загрузка']}
            morphTime={2}
            cooldownTime={0.25}
            className="pb-2 text-foreground opacity-60"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={funFact}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-md px-8 text-center"
            >
              <p className="mb-3 text-base text-foreground/60">Did you know?</p>
              <p className="text-base text-foreground/80">{funFact}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="fixed inset-x-0 bottom-0 pb-8">
          <AnimatePresence>
            {showHomeLink && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex justify-center"
              >
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="text-foreground/60 transition-colors hover:text-foreground/80"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Taking too long? Return Home
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.2)_100%)]" />
      </div>
    </div>
  );
}
