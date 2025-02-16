'use client';
import { cn } from '@/lib/utils';
import { Slider } from '@zephyr/ui/shadui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@zephyr/ui/shadui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FastForward,
  Maximize,
  MinimizeIcon,
  Pause,
  Play,
  Rewind,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CustomVideoPlayerProps {
  src: string;
  onLoadedData: () => void;
  onError: () => void;
  className?: string;
}

interface KeyboardControls {
  [key: string]: () => void;
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const CustomVideoPlayer = ({
  src,
  onLoadedData,
  onError,
  className,
}: CustomVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showHotkeys, setShowHotkeys] = useState(false);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const keyboardControls: KeyboardControls = {
      ' ': handlePlayPause,
      k: handlePlayPause,
      m: toggleMute,
      f: toggleFullscreen,
      ArrowLeft: () => skip(-10),
      ArrowRight: () => skip(10),
      ArrowUp: () => {
        const newVolume = Math.min(1, volume + 0.1);
        handleVolumeChange([newVolume]);
      },
      ArrowDown: () => {
        const newVolume = Math.max(0, volume - 0.1);
        handleVolumeChange([newVolume]);
      },
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        !showControls ||
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (keyboardControls[e.key]) {
        e.preventDefault();
        if (keyboardControls[e.key]) {
          keyboardControls[e.key]?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [volume, showControls]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      if (videoRef.current && newVolume !== undefined) {
        videoRef.current.volume = newVolume;
      }
      if (newVolume !== undefined) {
        setVolume(newVolume);
      }
      setIsMuted(newVolume === 0);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  const handleProgressChange = (value: number[]) => {
    if (videoRef.current) {
      const newTime = value[0];
      if (newTime !== undefined) {
        videoRef.current.currentTime = newTime;
      }
      if (newTime !== undefined) {
        setCurrentTime(newTime);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        videoRef.current.volume = 0;
        setVolume(0);
      } else {
        videoRef.current.volume = 1;
        setVolume(1);
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
  };

  const handlePlaybackSpeedChange = (speed: string) => {
    const newSpeed = Number.parseFloat(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
      setPlaybackSpeed(newSpeed);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2000);
  };

  return (
    // biome-ignore lint/nursery/noStaticElementInteractions: ignore
    <div
      ref={containerRef}
      className={cn(
        'group relative w-full overflow-hidden rounded-lg',
        isFullscreen && 'h-screen',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: ignore */}
      {/* biome-ignore lint/a11y/useMediaCaption: ignore */}
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full select-none outline-none focus:outline-none focus-visible:outline-none"
        onLoadedData={onLoadedData}
        onError={onError}
        onClick={handlePlayPause}
      />

      <div className="absolute top-4 left-4 z-40 opacity-30 transition-opacity duration-300 hover:opacity-60">
        <span className="font-medium text-sm text-white drop-shadow-lg">
          Zephyr
        </span>
      </div>

      <div className="absolute inset-0 z-30 flex select-none">
        {/* biome-ignore lint/nursery/noStaticElementInteractions: ignore */}
        <div
          className="h-full w-1/2"
          onDoubleClick={() => skip(-10)}
          title="Double click to rewind 10s"
        />
        {/* biome-ignore lint/nursery/noStaticElementInteractions: ingore */}
        <div
          className="h-full w-1/2"
          onDoubleClick={() => skip(10)}
          title="Double click to forward 10s"
        />
      </div>

      <AnimatePresence>
        {isBuffering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <div className="rounded-full bg-black/50 p-4 backdrop-blur-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-40 flex flex-col justify-between bg-gradient-to-t from-black/60 to-black/0"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex items-center justify-end gap-2 p-4"
            >
              <div className="relative">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="rounded-full bg-black/30 p-2 backdrop-blur-md transition-all duration-200 hover:bg-black/50"
                      >
                        <Settings className="h-4 w-4 text-white/90" />
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="bg-black/80 backdrop-blur-md"
                    >
                      <p className="text-xs">Playback Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <AnimatePresence>
                  {showSpeedMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          type: 'spring',
                          stiffness: 300,
                          damping: 30,
                        },
                      }}
                      exit={{
                        opacity: 0,
                        y: -5,
                        scale: 0.95,
                        transition: { duration: 0.15 },
                      }}
                      className="absolute top-full right-0 mt-2 origin-top-right"
                    >
                      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/80 shadow-lg backdrop-blur-md">
                        <div className="p-2">
                          <p className="mb-2 px-2 font-medium text-white/60 text-xs">
                            Playback Speed
                          </p>
                          <div className="space-y-0.5">
                            {PLAYBACK_SPEEDS.map((speed) => (
                              <motion.button
                                key={speed}
                                whileHover={{
                                  backgroundColor: 'rgba(255,255,255,0.1)',
                                }}
                                onClick={() =>
                                  handlePlaybackSpeedChange(speed.toString())
                                }
                                className={cn(
                                  'w-full rounded-md px-3 py-1.5 text-left text-xs transition-all',
                                  playbackSpeed === speed
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/70 hover:text-white'
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{speed}x</span>
                                  {playbackSpeed === speed && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="h-1.5 w-1.5 rounded-full bg-white"
                                    />
                                  )}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleFullscreen}
                      className="rounded-full bg-black/30 p-2 backdrop-blur-sm transition-colors hover:bg-black/70"
                    >
                      {isFullscreen ? (
                        <MinimizeIcon className="h-4 w-4 text-white/90" />
                      ) : (
                        <Maximize className="h-4 w-4 text-white/90" />
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="space-y-2 p-4"
            >
              {/* biome-ignore lint/nursery/noStaticElementInteractions: ignore */}
              <div
                className="group relative"
                onMouseEnter={() => setShowControls(true)}
              >
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration}
                  step={0.1}
                  onValueChange={handleProgressChange}
                  className="h-1 transition-all group-hover:h-1.5"
                />
                <div className="mt-1 flex justify-between text-white/80 text-xs">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => skip(-10)}
                          className="rounded-full bg-black/50 p-2 backdrop-blur-sm transition-colors hover:bg-black/70"
                        >
                          <Rewind className="h-5 w-5 text-white" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Rewind 10s (←)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handlePlayPause}
                          className="rounded-full bg-black/50 p-3 backdrop-blur-sm transition-colors hover:bg-black/70"
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6 text-white" />
                          ) : (
                            <Play className="h-6 w-6 text-white" />
                          )}
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Play/Pause (Space)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => skip(10)}
                          className="rounded-full bg-black/50 p-2 backdrop-blur-sm transition-colors hover:bg-black/70"
                        >
                          <FastForward className="h-5 w-5 text-white" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Forward 10s (→)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="relative flex items-center gap-2">
                  <div className="relative flex items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleMute}
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            className="rounded-full bg-black/30 p-2 backdrop-blur-md transition-all duration-200 hover:bg-black/50"
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="h-4 w-4 text-white/90" />
                            ) : (
                              <Volume2 className="h-4 w-4 text-white/90" />
                            )}
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-black/80 backdrop-blur-md"
                        >
                          <p className="text-xs">Mute (M)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{
                            width: '140px',
                            opacity: 1,
                            transition: {
                              width: {
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                              },
                              opacity: {
                                duration: 0.2,
                              },
                            },
                          }}
                          exit={{
                            width: 0,
                            opacity: 0,
                            transition: {
                              width: {
                                duration: 0.2,
                              },
                              opacity: {
                                duration: 0.1,
                              },
                            },
                          }}
                          className="ml-2 overflow-hidden"
                          onMouseLeave={() => setShowVolumeSlider(false)}
                        >
                          <motion.div
                            className="flex items-center gap-3 rounded-full bg-black/30 px-3 py-2 backdrop-blur-md"
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                          >
                            <Slider
                              value={[volume]}
                              min={0}
                              max={1}
                              step={0.01}
                              onValueChange={handleVolumeChange}
                              className="relative flex h-4 w-full touch-none select-none items-center"
                            >
                              <motion.div
                                className="relative h-1 w-full grow overflow-hidden rounded-full bg-white/20"
                                whileHover={{ height: '6px' }}
                                transition={{ duration: 0.2 }}
                              >
                                <motion.div
                                  className="absolute h-full bg-white/90"
                                  style={{ width: `${volume * 100}%` }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${volume * 100}%` }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 30,
                                  }}
                                />
                              </motion.div>
                            </Slider>
                            <span className="min-w-8 text-right font-medium text-white/90 text-xs">
                              {Math.round(volume * 100)}%
                            </span>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHotkeys && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowHotkeys(false)}
          >
            <div className="grid max-w-md gap-8 rounded-lg bg-black/90 p-6 text-white backdrop-blur-sm sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Keyboard Shortcuts</h3>
                <ul className="space-y-1 text-sm text-white/80">
                  <li>Space - Play/Pause</li>
                  <li>← → - Seek 10s</li>
                  <li>↑ ↓ - Volume</li>
                  <li>M - Mute</li>
                  <li>F - Fullscreen</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Mouse Controls</h3>
                <ul className="space-y-1 text-sm text-white/80">
                  <li>Double Click - Seek 10s</li>
                  <li>Hover Volume - Adjust</li>
                  <li>Click Settings - Speed</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
