"use client";

import { Menu } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import ContributeCard from "@zephyr-ui/misc/ContributionCard";
import CreatePostCard from "./left/CreatePostCard";
import Friends from "./left/Friends";
import NavigationCard from "./left/NavigationCard";

const LeftSideBar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [screenSize, setScreenSize] = useState("large");
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setScreenSize("small");
      } else if (window.innerWidth < 1024) {
        setScreenSize("medium");
        setIsCollapsed(true);
      } else {
        setScreenSize("large");
      }
    };

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const sidebarWidth = () => {
    if (screenSize === "small") return "w-0";
    if (screenSize === "medium") return "w-16";
    return isCollapsed ? "w-16" : "w-72";
  };

  const handleMenuClick = () => {
    if (screenSize === "large") {
      setIsCollapsed(!isCollapsed);
    }
  };

  const navTransform = `translateY(${Math.min(scrollPosition * 0.1, 20)}px)`;

  return (
    <aside
      className={`transition-all duration-300 ease-in-out ${sidebarWidth()} hidden bg-[hsl(var(--background-alt))] p-2 md:block`}
    >
      {screenSize !== "small" && (
        <div className="flex h-full flex-col">
          {/* Sticky Navigation with Scroll Animation */}
          <div
            className="sticky top-[80px] z-30"
            style={{
              transform: navTransform,
              transition: "transform 0.2s ease-out"
            }}
          >
            <div
              className={`ml-1 flex ${
                screenSize === "medium" || isCollapsed
                  ? "justify-center"
                  : "justify-start"
              }`}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMenuClick}
                disabled={screenSize === "medium"}
                className={`${
                  screenSize === "medium" || isCollapsed
                    ? "h-8 w-8 p-0"
                    : "w-full justify-center"
                } ${screenSize === "medium" ? "cursor-not-allowed opacity-50" : ""} transition-all duration-300`}
              >
                <Menu
                  className={`text-muted-foreground ${
                    screenSize === "medium" || isCollapsed
                      ? "h-6 w-6"
                      : "h-6 w-6"
                  }`}
                />
              </Button>
            </div>
            <div
              className={`mt-4 mb-4 ${
                screenSize === "medium" || isCollapsed ? "px-0" : "px-2"
              }`}
            >
              <NavigationCard
                isCollapsed={screenSize === "medium" || isCollapsed}
              />
              <div className="mt-4">
                <CreatePostCard
                  isCollapsed={screenSize === "medium" || isCollapsed}
                />
              </div>
            </div>
          </div>

          {/* Scrollable Section with Fade Animation */}
          <div className="mt-4 flex-1">
            <div
              className={`space-y-4 ${
                screenSize === "medium" || isCollapsed ? "px-0" : "px-2"
              } transition-opacity duration-300`}
              style={{
                opacity: Math.max(1 - scrollPosition * 0.003, 0),
                transform: `translateY(${Math.min(scrollPosition * 0.05, 10)}px)`,
                transition: "transform 0.2s ease-out, opacity 0.3s ease-out"
              }}
            >
              <Friends isCollapsed={screenSize === "medium" || isCollapsed} />
              <ContributeCard
                isCollapsed={screenSize === "medium" || isCollapsed}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default LeftSideBar;
