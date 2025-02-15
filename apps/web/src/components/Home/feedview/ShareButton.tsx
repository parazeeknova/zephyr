'use client';

import { cn } from '@/lib/utils';
import {
  Facebook,
  Instagram,
  LinkedIn,
  Pinterest,
  Reddit,
  Twitter,
  WhatsApp,
} from '@mui/icons-material';
import { DiscordLogoIcon } from '@radix-ui/react-icons';
import { Button } from '@zephyr/ui/shadui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@zephyr/ui/shadui/dialog';
import { Input } from '@zephyr/ui/shadui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@zephyr/ui/shadui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Download, Mail, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
const FALLBACK_THUMBNAIL = '/fallback.png';

interface ShareButtonProps {
  postId: string;
  title?: string;
  thumbnail?: string;
  description?: string;
}

interface ShareStats {
  platform: string;
  shares: number;
  clicks: number;
}

const ShareButton = ({
  postId,
  title,
  thumbnail,
  description,
}: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('social');
  const [shareStats, setShareStats] = useState<ShareStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const postUrl = `${baseUrl}/posts/${postId}`;

  useEffect(() => {
    if (isOpen) {
      fetchShareStats();
    }
  }, [isOpen]);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const fetchShareStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${postId}/share/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received share stats:', data);
      if (Array.isArray(data)) {
        setShareStats(data);
      } else {
        console.error('Invalid data format received:', data);
        setShareStats([]);
      }
    } catch (error) {
      console.error('Failed to fetch share stats:', error);
      toast.error('Failed to load share statistics');
      setShareStats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const trackShare = async (platform: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setShareStats((prev) =>
        prev.map((stat) =>
          stat.platform === platform ? { ...stat, shares: data.shares } : stat
        )
      );
    } catch (error) {
      console.error('Failed to track share:', error);
      toast.error('Failed to track share');
    }
  };

  const trackClick = async (platform: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/share/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setShareStats((prev) =>
        prev.map((stat) =>
          stat.platform === platform ? { ...stat, clicks: data.clicks } : stat
        )
      );
    } catch (error) {
      console.error('Failed to track click:', error);
      toast.error('Failed to track click');
    }
  };

  const socialShareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: '#1DA1F2',
      onClick: async () => {
        await trackShare('twitter');
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            postUrl
          )}&text=${encodeURIComponent(title || 'Check out this post!')}`,
          '_blank'
        );
        await trackClick('twitter');
      },
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: '#4267B2',
      onClick: async () => {
        await trackShare('facebook');
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
          '_blank'
        );
        await trackClick('facebook');
      },
    },
    {
      name: 'LinkedIn',
      icon: LinkedIn,
      color: '#0077B5',
      onClick: async () => {
        await trackShare('linkedin');
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
          '_blank'
        );
        await trackClick('linkedin');
      },
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: '#E4405F',
      onClick: async () => {
        await trackShare('instagram');
        await navigator.clipboard.writeText(postUrl);
        window.open('https://instagram.com', '_blank');
        toast.success('Link copied! Share it on Instagram');
        await trackClick('instagram');
      },
    },
    {
      name: 'Pinterest',
      icon: Pinterest,
      color: '#E60023',
      onClick: async () => {
        await trackShare('pinterest');
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(postUrl)}&media=${encodeURIComponent(thumbnail || '')}&description=${encodeURIComponent(description || '')}`,
          '_blank'
        );
        await trackClick('pinterest');
      },
    },
    {
      name: 'Reddit',
      icon: Reddit,
      color: '#FF4500',
      onClick: async () => {
        await trackShare('reddit');
        window.open(
          `https://reddit.com/submit?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(title || '')}`,
          '_blank'
        );
        await trackClick('reddit');
      },
    },
    {
      name: 'WhatsApp',
      icon: WhatsApp,
      color: '#25D366',
      onClick: async () => {
        await trackShare('whatsapp');
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${title || 'Check out this post!'} ${postUrl}`)}`,
          '_blank'
        );
        await trackClick('whatsapp');
      },
    },
    {
      name: 'Discord',
      icon: DiscordLogoIcon,
      color: '#5865F2',
      onClick: async () => {
        await trackShare('discord');
        window.open(
          `https://discord.com/channels/@me?message=${encodeURIComponent(
            `${title || 'Check out this post!'} ${postUrl}`
          )}`,
          '_blank'
        );
        await trackClick('discord');
      },
    },
    {
      name: 'Email',
      icon: Mail,
      color: '#EA4335',
      onClick: async () => {
        await trackShare('email');
        window.open(
          `mailto:?subject=${encodeURIComponent(
            title || 'Check out this post!'
          )}&body=${encodeURIComponent(`${description || ''}\n\n${postUrl}`)}`,
          '_blank'
        );
        await trackClick('email');
      },
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      await trackShare('copy');
    } catch (_err) {
      toast.error('Failed to copy link');
    }
  };

  const downloadQRCode = async () => {
    try {
      const svg = document.querySelector('.qr-code svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `qr-code-${postId}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        };
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
        await trackShare('qr');
        toast.success('QR Code downloaded!');
      }
    } catch (_error) {
      toast.error('Failed to download QR code');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group relative text-muted-foreground hover:text-foreground"
        >
          <Share2 className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="sr-only">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background/95 backdrop-blur-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Post
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="social"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <TabsContent value="social" className="mt-4">
                {thumbnail && (
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <img
                      src={thumbnail || FALLBACK_THUMBNAIL}
                      alt="Post thumbnail"
                      className="h-32 w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_THUMBNAIL;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  {socialShareOptions.map((option) => {
                    const stats = shareStats.find(
                      (stat) => stat.platform === option.name.toLowerCase()
                    );
                    return (
                      <motion.button
                        key={option.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative flex flex-col items-center justify-center rounded-lg border border-border p-4 transition-all hover:bg-accent hover:shadow-lg"
                        onClick={option.onClick}
                      >
                        <option.icon
                          className="mb-2 h-6 w-6 transition-transform group-hover:scale-110"
                          style={{ color: option.color }}
                        />
                        <span className="font-medium text-sm">
                          {option.name}
                        </span>
                        {stats && (
                          <div className="mt-1 text-muted-foreground text-xs">
                            {stats.shares > 0 && (
                              <span>{stats.shares} shares</span>
                            )}
                            {stats.clicks > 0 && (
                              <span> • {stats.clicks} clicks</span>
                            )}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="link" className="mt-4 space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={postUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="secondary"
                    className={cn(
                      'transition-all',
                      copied && 'bg-green-500 text-white hover:bg-green-600'
                    )}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <h4 className="mb-3 font-medium text-sm">Share Statistics</h4>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <motion.div
                        className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'linear',
                        }}
                      />
                    </div>
                  ) : shareStats.length > 0 ? (
                    <div className="grid gap-2">
                      {shareStats
                        .filter((stat) => stat.shares > 0 || stat.clicks > 0)
                        .map((stat) => (
                          <div
                            key={stat.platform}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="capitalize">{stat.platform}</span>
                            <div className="flex gap-4 text-muted-foreground">
                              <span>{stat.shares} shares</span>
                              <span>{stat.clicks} clicks</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="py-2 text-center text-muted-foreground text-sm">
                      No shares yet
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="qr" className="mt-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="qr-code rounded-lg bg-white p-4 shadow-lg transition-transform hover:scale-105">
                    <QRCodeSVG
                      value={postUrl}
                      size={200}
                      level="H"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={downloadQRCode}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download QR Code
                    </Button>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      Copy Link
                    </Button>
                  </div>
                  {shareStats.find((stat) => stat.platform === 'qr') && (
                    <div className="text-center text-muted-foreground text-sm">
                      {
                        shareStats.find((stat) => stat.platform === 'qr')
                          ?.shares
                      }{' '}
                      QR code downloads
                    </div>
                  )}
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        <div className="mt-4 flex flex-col gap-2 text-center">
          <div className="text-muted-foreground text-xs">
            Share this content responsibly
          </div>
          {isLoading && (
            <div className="text-muted-foreground text-xs">
              Loading share statistics...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareButton;
