"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface Requirement {
  text: string;
  regex: RegExp;
}

const requirements: Requirement[] = [
  {
    text: "At least 8 characters long",
    regex: /.{8,}/
  },
  {
    text: "Contains at least one uppercase letter",
    regex: /[A-Z]/
  },
  {
    text: "Contains at least one lowercase letter",
    regex: /[a-z]/
  },
  {
    text: "Contains at least one number",
    regex: /\d/
  },
  {
    text: "Contains at least one special character",
    regex: /[@$!%*?&]/
  }
];

interface PasswordStrengthCheckerProps {
  password: string;
}

export function PasswordStrengthChecker({
  password
}: PasswordStrengthCheckerProps) {
  const getStrengthPercent = () => {
    if (!password) return 0;
    const matchedRequirements = requirements.filter((req) =>
      req.regex.test(password)
    ).length;
    return (matchedRequirements / requirements.length) * 100;
  };

  const strengthPercent = getStrengthPercent();

  const getStrengthColor = () => {
    if (strengthPercent <= 25) return "bg-red-500";
    if (strengthPercent <= 50) return "bg-orange-500";
    if (strengthPercent <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strengthPercent <= 25) return "Weak";
    if (strengthPercent <= 50) return "Fair";
    if (strengthPercent <= 75) return "Good";
    return "Strong";
  };

  return (
    <AnimatePresence>
      {password.length > 0 && (
        <motion.div
          // @ts-expect-error
          className="mt-2 space-y-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                // @ts-expect-error
                className={`h-full rounded-full ${getStrengthColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${strengthPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Password Strength:</span>
              <motion.span
                // @ts-expect-error
                className={`font-medium ${getStrengthColor().replace("bg-", "text-")}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {getStrengthText()}
              </motion.span>
            </div>
          </div>

          <motion.div
            // @ts-expect-error
            className="space-y-2 rounded-lg border p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <p className="text-muted-foreground text-xs">
              Password Requirements:
            </p>
            <div className="space-y-2">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <AnimatePresence mode="wait">
                    {req.regex.test(password) ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        // @ts-expect-error
                        className="text-green-500"
                      >
                        <Check className="size-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="x"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        // @ts-expect-error
                        className="text-muted-foreground"
                      >
                        <X className="size-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span
                    className={`text-xs ${
                      req.regex.test(password)
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
