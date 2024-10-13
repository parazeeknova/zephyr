"use client";

import { motion } from "framer-motion";
import { CalendarIcon, GlobeIcon, Home, UsersRoundIcon } from "lucide-react";
import Link from "next/link";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NavigationCardProps {
  isCollapsed: boolean;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ isCollapsed }) => {
  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: GlobeIcon, label: "Discover", href: "/discover" },
    { icon: UsersRoundIcon, label: "People", href: "/people" },
    { icon: CalendarIcon, label: "Events", href: "/events" }
  ];

  return (
    <Card
      className={`bg-card transition-all duration-300 ease-in-out ${isCollapsed ? "w-12" : "w-full"}`}
    >
      <CardContent
        className={`flex flex-col items-center space-y-2 ${isCollapsed ? "p-2" : "p-4"}`}
      >
        {navItems.map((item) => (
          <motion.div
            key={item.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full"
          >
            <Link href={item.href} className="block w-full">
              <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "lg"}
                className={`w-full ${isCollapsed ? "justify-center" : "justify-start"}`}
                title={item.label}
              >
                <item.icon
                  className={`h-5 w-5 text-muted-foreground ${isCollapsed ? "" : "mr-4"}`}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NavigationCard;
