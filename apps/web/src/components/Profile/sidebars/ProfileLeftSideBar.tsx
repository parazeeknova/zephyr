"use client";

import type React from "react";

import Friends from "@zephyr-ui/Home/sidebars/left/Friends";
import NavigationCard from "@zephyr-ui/Home/sidebars/left/NavigationCard";
import AIGeneratedPosts from "@zephyr-ui/Profile/sidebars/left/AiGeneratedPosts";
import Analytics from "@zephyr-ui/Profile/sidebars/left/Analytics";
import RecentActivity from "@zephyr-ui/Profile/sidebars/left/RecentActivity";

// Temporary static data
const tempData = {
  aiGeneratedPosts: [
    {
      title: "Innovations in UI Design for 2024",
      summary: "AI-generated summary of your research on upcoming UI trends..."
    },
    {
      title: "The Impact of AR on User Experience",
      summary: "Based on your paper, here are key insights on AR in UX..."
    }
  ],
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
  <aside className="w-96 flex-shrink-0 overflow-y-auto bg-[hsl(var(--background-alt))] p-4 text-card-foreground">
    <div className="space-y-4">
      <NavigationCard isCollapsed={false} />
      <Friends isCollapsed={false} />
      <AIGeneratedPosts posts={tempData.aiGeneratedPosts} />
      <RecentActivity activities={tempData.recentActivity} />
      <Analytics data={tempData.analytics} />
    </div>
  </aside>
);

export default LeftSidebar;
