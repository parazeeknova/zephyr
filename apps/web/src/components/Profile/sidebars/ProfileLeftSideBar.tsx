"use client";

import type React from "react";

import Friends from "@zephyr-ui/Home/sidebars/left/Friends";
import NavigationCard from "@zephyr-ui/Home/sidebars/left/NavigationCard";
import Analytics from "@zephyr-ui/Profile/sidebars/left/Analytics";

// Temporary static data
const tempData = {
  analytics: {
    mostLikedPost: {
      title: "10 UX Principles Every Designer Should Know",
      likes: 1234
    },
    mostViewedPost: {
      title: "The Future of AI in UX Design",
      views: 5678
    }
  },
  recentActivity: [
    {
      action: "Commented on",
      target: '"The Role of AI in UX Design"',
      time: "2 hours ago"
    },
    {
      action: "Liked",
      target: '"Responsive Design Best Practices"',
      time: "1 day ago"
    },
    {
      action: "Shared",
      target: '"UX Trends for 2024"',
      time: "3 days ago"
    }
  ]
};

const LeftSidebar: React.FC = () => (
  <aside className="w-80 flex-shrink-0 overflow-y-auto bg-[hsl(var(--background-alt))] p-4 text-card-foreground">
    <div className="space-y-4">
      <NavigationCard isCollapsed={false} />
      <Friends isCollapsed={false} />
      <Analytics data={tempData.analytics} />
    </div>
  </aside>
);

export default LeftSidebar;
