"use client";

import { motion } from "framer-motion";
import {
  Construction,
  MessageSquareMore,
  Rocket,
  Sparkles,
  Wand
} from "lucide-react";

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut"
    }
  }
};

const iconAnimation = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

const textAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const containerAnimation = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function ComingSoon() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <motion.div
        variants={containerAnimation}
        initial="initial"
        animate="animate"
        // @ts-expect-error
        className="mx-auto max-w-2xl text-center"
      >
        {/* Floating Icons */}
        <motion.div
          variants={floatingAnimation}
          // @ts-expect-error
          className="relative mx-auto mb-8 h-32 w-32"
        >
          <motion.div
            variants={iconAnimation}
            // @ts-expect-error
            className="absolute top-0 left-0"
          >
            <MessageSquareMore className="h-12 w-12 text-primary/80" />
          </motion.div>
          <motion.div
            variants={iconAnimation}
            // @ts-expect-error
            className="absolute top-0 right-0"
          >
            <Sparkles className="h-10 w-10 text-primary/60" />
          </motion.div>
          <motion.div
            variants={iconAnimation}
            // @ts-expect-error
            className="absolute bottom-0 left-0"
          >
            <Construction className="h-10 w-10 text-primary/60" />
          </motion.div>
          <motion.div
            variants={iconAnimation}
            // @ts-expect-error
            className="absolute right-0 bottom-0"
          >
            <Rocket className="h-12 w-12 text-primary/80" />
          </motion.div>
        </motion.div>

        {/* Main Content */}
        {/* @ts-expect-error */}
        <motion.div variants={textAnimation} className="space-y-6 px-4">
          <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-bold text-4xl text-transparent">
            Coming Soon
          </h1>
          <p className="text-muted-foreground text-xl">
            We're crafting something special for you
          </p>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-muted-foreground/80">
              Our feature is under development. We're working hard to bring you
              a seamless experience with enhanced features and beautiful design.
            </p>
          </div>

          {/* Feature Preview */}
          <motion.div
            variants={containerAnimation}
            // @ts-expect-error
            className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <FeatureCard
              icon={<Wand className="h-6 w-6" />}
              title="Social Aggregation"
              description="View all trending posts across internet in one place"
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="AI Suggestions"
              description="Get personalized suggestions based on your interests and activities"
            />
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            variants={textAnimation}
            // @ts-expect-error
            className="mt-12 flex items-center justify-center gap-2 text-muted-foreground text-sm"
          >
            <Construction className="h-4 w-4 animate-spin" />
            <span>Development in progress</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      // @ts-expect-error
      className="rounded-xl border bg-card p-6 transition-colors duration-300 hover:bg-muted"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-left text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
}
