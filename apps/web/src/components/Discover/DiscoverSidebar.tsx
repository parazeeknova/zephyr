'use client';

import { Card, CardContent } from '@zephyr/ui/shadui/card';
import { Compass, Flame, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const DiscoverySidebar = () => {
  const pathname = usePathname();
  const navItems = [
    {
      icon: Sparkles,
      label: 'Suggested for you',
      href: '/discover',
    },
    {
      icon: Flame,
      label: 'Trending',
      href: '/discover/trending',
    },
    {
      icon: Users,
      label: 'New Users',
      href: '/discover/new',
    },
    {
      icon: Compass,
      label: 'Browse All',
      href: '/discover/browse',
    },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="mb-4 font-semibold text-muted-foreground text-sm uppercase">
          Discover
        </h2>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};

export default DiscoverySidebar;
