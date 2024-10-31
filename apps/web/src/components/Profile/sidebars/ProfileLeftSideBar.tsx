"use client";

import type React from "react";

import Friends from "@zephyr-ui/Home/sidebars/left/Friends";
import NavigationCard from "@zephyr-ui/Home/sidebars/left/NavigationCard";

const LeftSidebar: React.FC = () => (
  <aside className="hidden w-80 flex-shrink-0 overflow-y-auto bg-[hsl(var(--background-alt))] p-4 text-card-foreground md:block">
    <div className="space-y-4">
      <NavigationCard isCollapsed={false} />
      <Friends isCollapsed={false} />
      {/* <Analytics data={} /> */}
    </div>
  </aside>
);

export default LeftSidebar;
