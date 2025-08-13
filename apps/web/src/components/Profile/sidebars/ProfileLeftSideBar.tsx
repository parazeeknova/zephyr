'use client';

import Friends from '@/components/Home/sidebars/left/Friends';
import NavigationCard from '@/components/Home/sidebars/left/NavigationCard';
import type React from 'react';

const LeftSidebar: React.FC = () => (
  <aside className="hidden w-80 shrink-0 overflow-y-auto bg-[hsl(var(--background-alt))] p-4 text-card-foreground md:block">
    <div className="space-y-4">
      <NavigationCard isCollapsed={false} />
      <Friends isCollapsed={false} />
    </div>
  </aside>
);

export default LeftSidebar;
