import { useQuery } from '@tanstack/react-query';
import type { VoteInfo } from '@zephyr/db';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@zephyr/ui/shadui/tooltip';
import { Flame } from 'lucide-react';

interface AuraCountProps {
  postId: string;
  initialAura: number;
}

export default function AuraCount({ postId, initialAura }: AuraCountProps) {
  const queryKey = ['vote-info', postId];

  const { data } = useQuery<VoteInfo>({
    queryKey,
    initialData: { aura: initialAura, userVote: 0 },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: false,
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="mb-2 flex items-center font-semibold text-foreground text-lg">
            <Flame className="mr-1 h-5 w-5 text-orange-500" />
            <span>{data.aura}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Aura</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
