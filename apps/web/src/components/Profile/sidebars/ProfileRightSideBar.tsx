"use client";

import type React from "react";

import ThoughtShare from "@zephyr-ui/Home/sidebars/right/ThoughtShare";
import ProfileCard from "@zephyr-ui/Profile/sidebars/right/UserDetails";
import FollowedTopics from "@zephyr-ui/Profile/sidebars/right/UserFollowedTopics";
import InterestedCommunities from "@zephyr-ui/Profile/sidebars/right/UserIntrestedCommunities";

// Temporary static data
const tempData = {
  userDetails: {
    name: "Parazeeknova",
    role: "Pesky Corp CEO",
    avatar: "/useriii.jpg",
    followers: 1234,
    following: 567,
    aura: 69,
    bio: "Experienced Programmer with a strong background in Peskyness, programming and designing.",
    socialMedia: [
      { platform: "Twitter", username: "@hashcodes_" },
      { platform: "Instagram", username: "@hashcodes" },
      { platform: "GitHub", username: "parazeeknova" },
      { platform: "Reddit", username: "u/parazeeknova" }
    ]
  },
  followedTopics: [
    "UX Design",
    "UI Trends",
    "Accessibility",
    "Mobile UX",
    "Design Systems",
    "User Research",
    "Interaction Design",
    "Prototyping",
    "Visual Design",
    "Information Architecture"
  ],
  interestedCommunities: [
    "UX/UI Designers",
    "Tech Innovators",
    "Accessibility Advocates",
    "Frontend Developers",
    "Product Managers"
  ]
};

const RightSidebar: React.FC = () => (
  <aside className="w-96 flex-shrink-0 overflow-y-auto bg-[hsl(var(--background-alt))] p-4 text-card-foreground">
    <div className="space-y-4">
      <ProfileCard data={tempData.userDetails} />
      <ThoughtShare />
      <FollowedTopics topics={tempData.followedTopics} />
      <InterestedCommunities communities={tempData.interestedCommunities} />
    </div>
  </aside>
);

export default RightSidebar;
