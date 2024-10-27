import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import Link from "next/link";

interface HeaderIconButtonProps {
  href: string;
  icon: React.ReactNode;
  count?: number;
  title: string;
}

export function HeaderIconButton({
  href,
  icon,
  count,
  title
}: HeaderIconButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="relative rounded-full border border-border/50 bg-background/40 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-border/80 hover:bg-background/60 hover:shadow-md"
              asChild
            >
              <Link href={href} className="block">
                <div className="relative text-muted-foreground">
                  {icon}
                  {!!count && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      // @ts-expect-error
                      className="-right-1 -top-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary font-medium text-[10px] text-primary-foreground shadow-sm"
                    >
                      {count}
                    </motion.span>
                  )}
                </div>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}
