'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface GooeyTextProps {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
}

export function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 0.25,
  className,
  textClassName,
}: GooeyTextProps) {
  const text1Ref = React.useRef<HTMLSpanElement>(null);
  const text2Ref = React.useRef<HTMLSpanElement>(null);
  const textsRef = React.useRef<string[]>(texts);

  // Keep a stable reference to the texts array to avoid restarting animation
  React.useEffect(() => {
    textsRef.current = texts;
  }, [texts]);

  React.useEffect(() => {
    const localTexts = textsRef.current;
    if (!localTexts || localTexts.length === 0) {
      return;
    }

    let textIndex = 0;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;
    let rafId = 0 as number | 0;

    // initialize content so it's not blank on mount
    if (text1Ref.current && text2Ref.current) {
      text1Ref.current.textContent = localTexts[textIndex % localTexts.length];
      text2Ref.current.textContent =
        localTexts[(textIndex + 1) % localTexts.length];
      text1Ref.current.style.opacity = '0%';
      text2Ref.current.style.opacity = '100%';
    }

    const setMorph = (fraction: number) => {
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        text2Ref.current.style.opacity = `${fraction ** 0.4 * 100}%`;

        const inv = 1 - fraction;
        text1Ref.current.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`;
        text1Ref.current.style.opacity = `${inv ** 0.4 * 100}%`;
      }
    };

    const doCooldown = () => {
      morph = 0;
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = '';
        text2Ref.current.style.opacity = '100%';
        text1Ref.current.style.filter = '';
        text1Ref.current.style.opacity = '0%';
      }
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(Math.max(0.0001, fraction));
    };

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const newTime = new Date();
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;

      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % localTexts.length;
          if (text1Ref.current && text2Ref.current) {
            text1Ref.current.textContent =
              localTexts[textIndex % localTexts.length];
            text2Ref.current.textContent =
              localTexts[(textIndex + 1) % localTexts.length];
          }
        }
        doMorph();
      } else {
        doCooldown();
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [morphTime, cooldownTime]);

  return (
    <div className={cn('relative', className)}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="flex items-center justify-center"
        style={{ filter: 'url(#threshold)' }}
      >
        <span
          ref={text1Ref}
          className={cn(
            'absolute inline-block select-none text-center text-3xl sm:text-4xl md:text-5xl',
            'text-foreground',
            textClassName
          )}
        />
        <span
          ref={text2Ref}
          className={cn(
            'absolute inline-block select-none text-center text-3xl sm:text-4xl md:text-5xl',
            'text-foreground',
            textClassName
          )}
        />
      </div>
    </div>
  );
}
