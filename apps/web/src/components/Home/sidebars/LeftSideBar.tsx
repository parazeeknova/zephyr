"use client";

import { Menu } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Friends from "./left/Friends";
import MyGroups from "./left/MyGroups";
import NavigationCard from "./left/NavigationCard";
import UpcomingEvents from "./left/UpcomingEvent";

const LeftSideBar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [screenSize, setScreenSize] = useState("large");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setScreenSize("small");
      } else if (window.innerWidth < 1024) {
        setScreenSize("medium");
        setIsCollapsed(true);
      } else {
        setScreenSize("large");
        setIsCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // These would typically come from an API or state management
  const myGroupsData = [
    { name: "Picktab Studio", icon: "🎨" },
    { name: "Arasaka Digital", icon: "🚀" },
    { name: "Design Jam", icon: "🌵" },
    { name: "Figma Jam", icon: "💡" }
  ];

  const upcomingEventsData = [
    { name: "Tech Conference 2023", color: "text-red-500 dark:text-red-400" },
    { name: "Design Meetup", color: "text-yellow-500 dark:text-yellow-400" },
    { name: "Hackathon", color: "text-green-500 dark:text-green-400" }
  ];

  const sidebarWidth = () => {
    if (screenSize === "small") return "w-0";
    if (screenSize === "medium" || (isCollapsed && !isHovered)) return "w-16";
    return "w-64";
  };

  return (
    <aside
      className={`transition-all duration-300 ease-in-out ${sidebarWidth()} bg-[hsl(var(--background-alt))] p-2`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {screenSize !== "small" && (
        <div className="flex flex-col space-y-4">
          <div
            className={`ml-1 flex ${isCollapsed && !isHovered ? "justify-center" : "justify-start"}`}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`${isCollapsed && !isHovered ? "h-8 w-8 p-0" : "w-full justify-center"}`}
            >
              <Menu
                className={`text-muted-foreground ${
                  isCollapsed && !isHovered ? "h-6 w-6" : "h-6 w-6"
                }`}
              />
            </Button>
          </div>
          <div
            className={`space-y-4 ${isCollapsed && !isHovered ? "px-0" : "px-2"}`}
          >
            <NavigationCard isCollapsed={isCollapsed && !isHovered} />
            <MyGroups
              groups={myGroupsData}
              isCollapsed={isCollapsed && !isHovered}
            />
            <Friends isCollapsed={isCollapsed && !isHovered} />
            <UpcomingEvents
              events={upcomingEventsData}
              isCollapsed={isCollapsed && !isHovered}
            />
          </div>
        </div>
      )}
    </aside>
  );
};

export default LeftSideBar;
