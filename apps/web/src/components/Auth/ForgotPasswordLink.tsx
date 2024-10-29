"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ForgotPasswordLink() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      // @ts-expect-error
      className="text-center"
    >
      <Link
        href="/reset-password"
        className="text-muted-foreground text-sm transition-colors hover:text-primary"
      >
        Forgot your password?
      </Link>
    </motion.div>
  );
}
