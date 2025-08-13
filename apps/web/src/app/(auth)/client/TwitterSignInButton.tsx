import { Button } from '@zephyr/ui/shadui/button';

export default function TwitterSignInButton() {
  return (
    <Button
      variant="outline"
      className="w-full border-0 bg-white/5 text-foreground backdrop-blur-xs transition-all duration-300 hover:bg-white/10"
      asChild
    >
      <a
        href="/login/twitter"
        className="flex items-center justify-center py-6"
      >
        <TwitterIcon />
      </a>
    </Button>
  );
}

function TwitterIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Twitter icon is purely decorative
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="transform transition-transform duration-300 group-hover:scale-110"
    >
      <defs>
        <linearGradient
          id="twitterGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style={{ stopColor: '#ffffff' }} />
          <stop offset="100%" style={{ stopColor: '#A8A8A8' }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow)">
        <path
          fill="url(#twitterGradient)"
          d="M13.479 10.479L21.78 1h-2.18l-7.217 8.255L6.775 1H1l8.51 12.37L1 23h2.18l7.615-8.697L16.725 23H22.5l-9.021-12.521zm-1.095 1.252l-.88-1.256L4.33 2.34h2.81l5.745 8.217.88 1.256 7.51 10.733h-2.81l-5.991-8.563z"
        />
      </g>
    </svg>
  );
}
