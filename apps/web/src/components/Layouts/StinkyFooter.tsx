import Link from "next/link";
import type React from "react";

const StickyFooter: React.FC = () => {
  return (
    <div className="hidden space-y-1 text-muted-foreground text-sm md:block">
      <div className="flex items-center justify-center space-x-2">
        <span className="font-sofiaProSoftBold">&copy; 2024</span>
        <span className="font-sofiaProSoftBold">Zephyr</span>
        <Link href="/toc" className="hover:underline">
          Terms
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
        <Link href="/soon" className="hover:underline">
          Feedback
        </Link>
      </div>
      <div className="flex justify-center space-x-2">
        <Link href="/soon" className="hover:underline">
          Status
        </Link>
        <a
          href="/soon"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground"
        >
          Discord
        </a>
        <a
          href="https://github.com/parazeeknova/zephyr"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground"
        >
          Github
        </a>
        <a
          href="https://x.com/hashcodes_"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground"
        >
          Twitter
        </a>
        <Link href="/soon" className="hover:underline">
          Rules
        </Link>
      </div>
      <div className="flex justify-center space-x-2">
        <Link href="/support" className="hover:underline">
          Support
        </Link>
        <Link href="/soon" className="hover:underline">
          About
        </Link>
        <Link href="/soon" className="hover:underline">
          More...
        </Link>
      </div>
    </div>
  );
};

export default StickyFooter;
