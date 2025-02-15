import { useUpdateAvatarMutation } from '@/app/(main)/users/[username]/avatar-mutations';
import LoadingButton from '@/components/Auth/LoadingButton';
import { useToast } from '@zephyr/ui/hooks/use-toast';
import { Button } from '@zephyr/ui/shadui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zephyr/ui/shadui/dialog';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useRef, useState } from 'react';

interface GifCenteringDialogProps {
  gifFile: File;
  onClose: () => void;
  currentValues: {
    displayName: string;
    bio: string;
    userId: string;
    oldAvatarKey?: string | null;
  };
}

export default function GifCenteringDialog({
  gifFile,
  onClose,
  currentValues,
}: GifCenteringDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gifRef = useRef<HTMLImageElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const mutation = useUpdateAvatarMutation();
  const { toast } = useToast();

  const MOVE_AMOUNT = 10;
  const ZOOM_STEP = 0.1;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    setPosition((prev) => {
      switch (direction) {
        case 'up':
          return { ...prev, y: prev.y + MOVE_AMOUNT };
        case 'down':
          return { ...prev, y: prev.y - MOVE_AMOUNT };
        case 'left':
          return { ...prev, x: prev.x + MOVE_AMOUNT };
        case 'right':
          return { ...prev, x: prev.x - MOVE_AMOUNT };
        default:
          return prev;
      }
    });
  };

  const handleZoom = (increase: boolean) => {
    setZoom((prev) => {
      const newZoom = increase ? prev + ZOOM_STEP : prev - ZOOM_STEP;
      return Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
    });
  };

  const handleComplete = async () => {
    try {
      const timestamp = Date.now();
      const safePosition = {
        x: Math.round(position.x * 100) / 100,
        y: Math.round(position.y * 100) / 100,
        z: Math.round(zoom * 100) / 100,
      };

      const transformedFileName = `avatar_${timestamp}_x${safePosition.x}_y${safePosition.y}_z${safePosition.z}.gif`;

      const file = new File([gifFile], transformedFileName, {
        type: 'image/gif',
      });

      await mutation.mutateAsync({
        file,
        userId: currentValues.userId,
        oldAvatarKey: currentValues.oldAvatarKey || undefined,
      });

      onClose();
    } catch (error) {
      console.error('Error processing GIF:', error);
      toast({
        title: 'Error',
        description: 'Failed to update avatar. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Center Your GIF</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div
            ref={containerRef}
            className="relative size-64 overflow-hidden rounded-full border-2 border-border bg-secondary"
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                x: position.x,
                y: position.y,
                scale: zoom,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Image
                ref={gifRef}
                src={URL.createObjectURL(gifFile)}
                alt="GIF preview"
                className="max-w-none"
                style={{
                  transformOrigin: 'center',
                }}
                draggable={false}
                layout="fill"
                objectFit="contain"
              />
            </motion.div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <div />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMove('up')}
                disabled={mutation.isPending}
              >
                <ChevronUp className="size-4" />
              </Button>
              <div />

              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMove('left')}
                disabled={mutation.isPending}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Move</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMove('right')}
                disabled={mutation.isPending}
              >
                <ChevronRight className="size-4" />
              </Button>

              <div />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleMove('down')}
                disabled={mutation.isPending}
              >
                <ChevronDown className="size-4" />
              </Button>
              <div />
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleZoom(false)}
                disabled={zoom <= MIN_ZOOM || mutation.isPending}
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="min-w-12 text-center text-sm">
                {(zoom * 100).toFixed(0)}%
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleZoom(true)}
                disabled={zoom >= MAX_ZOOM || mutation.isPending}
              >
                <ZoomIn className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <LoadingButton onClick={handleComplete} loading={mutation.isPending}>
            Apply Changes
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
