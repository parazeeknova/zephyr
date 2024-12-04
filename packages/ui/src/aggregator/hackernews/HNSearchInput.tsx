"use client";

import { cn } from "@/lib/utils";
import { Input } from "@C/input";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

interface HNSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const searchVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  },
  exit: { scale: 0.95, opacity: 0 }
};

export function HNSearchInput({
  value,
  onChange,
  placeholder = "Search stories...",
  className
}: HNSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <motion.div
      variants={searchVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      // @ts-expect-error
      className={cn("relative", className)}
    >
      <div className="relative flex items-center">
        <motion.div
          animate={{
            scale: isFocused ? 1.1 : 1,
            color: isFocused ? "var(--orange-500)" : "var(--muted-foreground)"
          }}
          // @ts-expect-error
          className="pointer-events-none absolute left-3"
        >
          <Search className="h-4 w-4" />
        </motion.div>

        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-full",
            "pr-8 pl-9",
            "h-10",
            "bg-background/50 backdrop-blur-sm",
            "border-muted-foreground/20",
            "placeholder:text-muted-foreground/50",
            "focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
            "transition-all duration-200"
          )}
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              // @ts-expect-error
              onClick={handleClear}
              className="absolute right-3 text-muted-foreground transition-colors hover:text-foreground"
              type="button"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        //@ts-expect-error
        className="-z-10 absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100"
        initial={false}
        animate={{ opacity: isFocused ? 1 : 0 }}
      />
    </motion.div>
  );
}
