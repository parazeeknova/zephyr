import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedZephyrTextProps {
  className?: string;
}

export const AnimatedZephyrText = ({ className }: AnimatedZephyrTextProps) => {
  const letters = "ZEPHYR.".split("");

  return (
    <motion.div
      className={cn(
        "pointer-events-none z-10 select-none font-bold text-4xl sm:text-6xl",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.7 }}
    >
      <div className="relative flex">
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            className="text-primary/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 1, 1, 0.3, 1],
              y: [20, 0, 0, 0, 0]
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.1,
              times: [0, 0.2, 0.5, 0.8, 1]
            }}
            style={{
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              display: "inline-block"
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-primary/30"
        initial={{ scaleX: 0 }}
        animate={{
          scaleX: [0, 1, 1, 1, 0],
          opacity: [0, 1, 1, 0.3, 0]
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 0.8, 1]
        }}
        style={{ transformOrigin: "left" }}
      />
    </motion.div>
  );
};
