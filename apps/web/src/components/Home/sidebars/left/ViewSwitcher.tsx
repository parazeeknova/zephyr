"use client";

import { motion } from "framer-motion";
import { Grid, List } from "lucide-react";

interface ViewSwitcherProps {
  view: "grid" | "list";
  onChange: (view: "grid" | "list") => void;
}

export const ViewSwitcher = ({ view, onChange }: ViewSwitcherProps) => {
  return (
    <div className="flex items-center justify-center gap-6">
      {/* biome-ignore lint/a11y/useButtonType: ignore */}
      <button onClick={() => onChange("list")} className="group relative pb-1">
        <List
          className={`h-4 w-4 transition-colors ${
            view === "list" ? "text-primary" : "text-muted-foreground"
          }`}
        />
        {view === "list" && (
          <motion.div
            layoutId="viewIndicator"
            className="-bottom-1 absolute right-0 left-0 h-[2px] bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </button>

      {/* biome-ignore lint/a11y/useButtonType: ignore */}
      <button onClick={() => onChange("grid")} className="group relative pb-1">
        <Grid
          className={`h-4 w-4 transition-colors ${
            view === "grid" ? "text-primary" : "text-muted-foreground"
          }`}
        />
        {view === "grid" && (
          <motion.div
            layoutId="viewIndicator"
            className="-bottom-1 absolute right-0 left-0 h-[2px] bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </button>
    </div>
  );
};
