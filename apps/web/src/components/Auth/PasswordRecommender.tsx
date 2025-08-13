'use client';

import type { SignUpValues } from '@zephyr/auth/validation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Lightbulb, Wand2 } from 'lucide-react';
import { useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import {
  lowercaseRegex,
  onenumberRegex,
  specialCharRegex,
  uppercaseRegex,
} from './PasswordStrengthChecker';

interface Requirement {
  text: string;
  validator: (password: string) => boolean;
}

interface PasswordRecommenderProps {
  password: string;
  requirements: Requirement[];
  setValue: UseFormSetValue<SignUpValues>;
  setPassword: (value: string) => void;
}

export function PasswordRecommender({
  password,
  requirements,
  setValue,
  setPassword,
}: PasswordRecommenderProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRecommendation = (password: string): string => {
    if (!password) {
      return '';
    }

    let recommendation = password;
    let failedRequirements = requirements.filter(
      (req) => !req.validator(password)
    );

    // biome-ignore lint/complexity/noForEach: ignore
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: ignore
    failedRequirements.forEach((req) => {
      // biome-ignore lint/style/useDefaultSwitchClause: ignore
      switch (req.text) {
        case 'At least 8 characters long': {
          while (recommendation.length < 8) {
            const missingRequirements = requirements.filter(
              (r) => !r.validator(recommendation)
            );
            if (missingRequirements.some((r) => r.text.includes('uppercase'))) {
              recommendation += 'K';
            } else if (
              missingRequirements.some((r) => r.text.includes('number'))
            ) {
              recommendation += Math.floor(Math.random() * 9) + 1;
            } else if (
              missingRequirements.some((r) => r.text.includes('special'))
            ) {
              recommendation += '@$!%*?&#'[Math.floor(Math.random() * 8)];
            } else {
              recommendation += 'x';
            }
          }
          break;
        }

        case 'Contains at least one uppercase letter':
          if (!uppercaseRegex.test(recommendation)) {
            const letterMatch = recommendation.match(lowercaseRegex);
            if (letterMatch) {
              const pos = recommendation.indexOf(letterMatch[0]);
              recommendation =
                recommendation.slice(0, pos) +
                recommendation.charAt(pos).toUpperCase() +
                recommendation.slice(pos + 1);
            } else {
              recommendation += 'K';
            }
          }
          break;

        case 'Contains at least one lowercase letter':
          if (!lowercaseRegex.test(recommendation)) {
            recommendation += 'x';
          }
          break;

        case 'Contains at least one number': {
          if (!onenumberRegex.test(recommendation)) {
            const numberMappings: Record<string, string> = {
              o: '0',
              i: '1',
              z: '2',
              e: '3',
              a: '4',
              s: '5',
              g: '6',
              t: '7',
              b: '8',
              q: '9',
            };

            let numberAdded = false;
            for (const [letter, num] of Object.entries(numberMappings)) {
              if (recommendation.toLowerCase().includes(letter)) {
                recommendation = recommendation.replace(
                  new RegExp(letter, 'i'),
                  num
                );
                numberAdded = true;
                break;
              }
            }

            if (!numberAdded) {
              recommendation += Math.floor(Math.random() * 9) + 1;
            }
          }
          break;
        }

        case 'Contains at least one special character': {
          if (!specialCharRegex.test(recommendation)) {
            const specialMappings: Record<string, string> = {
              a: '@',
              i: '!',
              s: '$',
              h: '#',
              o: '*',
              x: '%',
              n: '&',
            };

            let specialAdded = false;
            for (const [letter, special] of Object.entries(specialMappings)) {
              if (recommendation.toLowerCase().includes(letter)) {
                recommendation = recommendation.replace(
                  new RegExp(letter, 'i'),
                  special
                );
                specialAdded = true;
                break;
              }
            }

            if (!specialAdded) {
              recommendation += '@';
            }
          }
          break;
        }

        case 'No repeated characters (3+ times)':
          recommendation = recommendation.replace(/(.)\1{2,}/g, (match) => {
            const char = match[0];
            // @ts-expect-error - TS doesn't recognize the key exists
            const alternatives: Record<string, string[]> = {
              a: ['@', '4'],
              e: ['3'],
              i: ['1', '!'],
              o: ['0', '*'],
              s: ['$', '5'],
              t: ['7', '+'],
            }[char?.toLowerCase() as keyof typeof alternatives] || [char];

            return (
              char +
              (Array.isArray(alternatives) && alternatives.length > 0
                ? alternatives[Math.floor(Math.random() * alternatives.length)]
                : char)
            );
          });
          break;

        case 'No common sequences (123, abc)':
          recommendation = recommendation
            .replace(/123/g, '1#3')
            .replace(/abc/gi, '@bc')
            .replace(/xyz/gi, 'x*z')
            .replace(/qwe/gi, 'q$e')
            .replace(/password/gi, 'p@$$w0rd')
            .replace(/admin/gi, '@dm!n')
            .replace(/user/gi, 'u$er')
            .replace(/login/gi, 'l0g!n');
          break;
      }

      failedRequirements = requirements.filter(
        (req) => !req.validator(recommendation)
      );
    });

    if (failedRequirements.length > 0) {
      const base = recommendation.slice(0, 4);
      recommendation = `${base}K7@x${Math.floor(Math.random() * 100)}`;
    }

    return recommendation;
  };

  const recommendedPassword = generateRecommendation(password);
  const shouldShowRecommendation = password && recommendedPassword !== password;

  const handleUseRecommendation = () => {
    setIsGenerating(true);
    if (setValue) {
      setValue('password', recommendedPassword, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      setPassword(recommendedPassword);
    }
    setTimeout(() => setIsGenerating(false), 500);
  };

  return (
    <AnimatePresence mode="wait">
      {shouldShowRecommendation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-2 rounded-lg border border-yellow-200 bg-yellow-50/50 p-3 backdrop-blur-xs dark:border-yellow-900/50 dark:bg-yellow-900/20"
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 size-4 text-yellow-600 dark:text-yellow-400" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Suggested stronger password:
              </p>
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-sm bg-yellow-100/80 px-2 py-1 font-mono text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-100"
                >
                  {recommendedPassword}
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isGenerating}
                  onClick={handleUseRecommendation}
                  className="flex items-center gap-1 rounded-md bg-yellow-200/80 px-2 py-1 font-medium text-xs text-yellow-900 transition-colors duration-200 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-yellow-900/60 dark:text-yellow-100 dark:hover:bg-yellow-900/80"
                >
                  {isGenerating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                      }}
                    >
                      <Wand2 className="size-3" />
                    </motion.div>
                  ) : (
                    <>
                      Use this
                      <ArrowRight className="size-3" />
                    </>
                  )}
                </motion.button>
              </div>
              <p className="mt-1 text-xs text-yellow-700/80 dark:text-yellow-300/80">
                This suggestion maintains similarity to your input while meeting
                security requirements.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
