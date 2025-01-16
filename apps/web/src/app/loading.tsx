"use client";

import { getRandomFact } from "@/components/Constants/loading-facts";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function Loading() {
  const [funFact, setFunFact] = useState("");
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

  const particles = useMemo(
    () =>
      Array(30)
        .fill(0)
        // biome-ignore lint/correctness/noUnusedVariables: This is a custom loading component
        .map((_, i) => ({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 2 + Math.random() * 4,
          duration: 4 + Math.random() * 6,
          delay: Math.random() * 2
        })),
    []
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(600px at 0% 0%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(800px at 100% 100%, rgba(255,255,255,0.03) 0%, transparent 50%)",
              "radial-gradient(600px at 100% 0%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(800px at 0% 100%, rgba(255,255,255,0.03) 0%, transparent 50%)",
              "radial-gradient(600px at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(800px at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 50%)",
              "radial-gradient(600px at 0% 0%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(800px at 100% 100%, rgba(255,255,255,0.03) 0%, transparent 50%)"
            ]
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            background: [
              "radial-gradient(1000px at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)",
              "radial-gradient(1000px at 30% 70%, rgba(255,255,255,0.02) 0%, transparent 70%)",
              "radial-gradient(1000px at 70% 30%, rgba(255,255,255,0.02) 0%, transparent 70%)",
              "radial-gradient(1000px at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)"
            ]
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear"
          }}
        />
      </div>

      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`
          }}
          animate={{
            y: ["0%", "-100%"],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
            ease: "linear"
          }}
        />
      ))}

      <div className="relative flex min-h-screen w-full flex-col items-center justify-center">
        <motion.div
          className="absolute h-[600px] w-[600px] rounded-full border border-white/02"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute h-[500px] w-[500px] rounded-full border border-white/02"
          animate={{
            rotate: [360, 0]
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear"
          }}
        />

        <div className="relative flex flex-col items-center justify-center space-y-16">
          <motion.p
            className="font-medium text-2xl text-foreground/60"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut"
            }}
          >
            Loading
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut"
              }}
            >
              ....
            </motion.span>
          </motion.p>

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
