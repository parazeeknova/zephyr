"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";

export default function NotFound() {
  const nebulaElements = useMemo(() => {
    return Array(5)
      .fill(0)
      .map((_, i) => ({
        width: 200 + ((i * 127) % 400),
        height: 200 + ((i * 127) % 400),
        top: `${(i * 20) % 100}%`,
        left: `${(i * 25) % 100}%`,
        delay: i * 0.5,
        color: i % 3
      }));
  }, []);

  const starElements = useMemo(() => {
    return Array(20)
      .fill(0)
      .map((_, i) => ({
        top: `${(i * 5) % 100}%`,
        left: `${(i * 7) % 100}%`,
        duration: 5 + (i % 5) * 2,
        delay: (i % 5) * 1
      }));
  }, []);

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-background/50 to-background"
      suppressHydrationWarning
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),rgba(0,0,0,1))]" />
          <div className="stars" />
          <div className="stars2" />
          <div className="stars3" />
        </div>

        <div className="absolute inset-0 overflow-hidden">
          {nebulaElements.map((nebula, i) => (
            <div
              key={i}
              className="absolute animate-pulse rounded-full blur-3xl"
              style={{
                width: `${nebula.width}px`,
                height: `${nebula.height}px`,
                background: `radial-gradient(circle at center, 
                  ${["rgba(147,51,234,0.15)", "rgba(79,70,229,0.15)", "rgba(236,72,153,0.15)"][nebula.color]},
                  transparent)`,
                top: nebula.top,
                left: nebula.left,
                animationDelay: `${nebula.delay}s`,
                animationDuration: "5s"
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          // @ts-expect-error
          className="space-y-10"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            // @ts-expect-error
            className="relative"
          >
            <div className="relative">
              <h1 className="select-none font-bold text-[12rem] text-primary/5 leading-none tracking-tight">
                404
              </h1>
              <h1 className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 font-bold text-7xl text-primary">
                404
              </h1>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            // @ts-expect-error
            className="space-y-4"
          >
            <h2 className="font-bold text-3xl text-foreground">
              Lost in Space
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground text-xl">
              The page you're looking for has drifted away into the cosmic void.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            // @ts-expect-error
            className="relative"
          >
            <Link href="/">
              <Button
                size="lg"
                className="group relative px-8 py-6 text-lg transition-all hover:scale-105"
              >
                <span className="relative z-10">Return Home</span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-primary/50 to-primary opacity-50 blur-lg transition-all group-hover:opacity-75" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {starElements.map((star, i) => (
          <div
            key={i}
            className="absolute h-0.5 w-0.5 rounded-full bg-white"
            style={{
              top: star.top,
              left: star.left,
              animation: `shootingStars ${star.duration}s linear infinite`,
              animationDelay: `${star.delay}s`,
              opacity: 0.7,
              transform: `rotate(${(i * 45) % 360}deg)`
            }}
          />
        ))}
      </div>
    </div>
  );
}
