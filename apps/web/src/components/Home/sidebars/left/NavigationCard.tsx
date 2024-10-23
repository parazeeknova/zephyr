"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Home, MessageCircle, TrendingUp, UsersRoundIcon } from "lucide-react";
import Link from "next/link";

interface NavigationCardProps {
  isCollapsed: boolean;
  className?: string;
  stickyTop?: string;
}

export default function NavigationCard({
  isCollapsed,
  className = "",
  stickyTop = "0"
}: NavigationCardProps) {
  return (
    <Card
      className={`max-h-fit bg-card transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-12" : "w-full"
      } ${className} sticky`}
      style={{ top: stickyTop }}
    >
      <CardContent
        className={`flex flex-col items-center space-y-2 ${
          isCollapsed ? "p-2" : "p-4"
        }`}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full"
        >
          <Link href="/" className="block w-full">
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "lg"}
              className={`w-full ${
                isCollapsed ? "justify-center" : "justify-start"
              }`}
              title="Home"
            >
              <Home
                className={`h-5 w-5 text-muted-foreground ${
                  isCollapsed ? "" : "mr-4"
                }`}
              />
              {!isCollapsed && <span>Home</span>}
            </Button>
          </Link>
        </motion.div>

        {/* Will be replaced by MessageButton in messages component*/}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full"
        >
          <Link href="/messages" className="block w-full">
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "lg"}
              className={`w-full ${
                isCollapsed ? "justify-center" : "justify-start"
              }`}
              title="Whispers"
            >
              <MessageCircle
                className={`h-5 w-5 text-muted-foreground ${
                  isCollapsed ? "" : "mr-4"
                }`}
              />
              {!isCollapsed && <span>Whispers</span>}
            </Button>
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full"
        >
          <Link href="/people" className="block w-full">
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "lg"}
              className={`w-full ${
                isCollapsed ? "justify-center" : "justify-start"
              }`}
              title="Zephyrians"
            >
              <UsersRoundIcon
                className={`h-5 w-5 text-muted-foreground ${
                  isCollapsed ? "" : "mr-4"
                }`}
              />
              {!isCollapsed && <span>Zephyrians</span>}
            </Button>
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full"
        >
          <Link href="/trending" className="block w-full">
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "lg"}
              className={`w-full ${
                isCollapsed ? "justify-center" : "justify-start"
              }`}
              title="Gusts"
            >
              <TrendingUp
                className={`h-5 w-5 text-muted-foreground ${
                  isCollapsed ? "" : "mr-4"
                }`}
              />
              {!isCollapsed && <span>Gusts</span>}
            </Button>
          </Link>
        </motion.div>
      </CardContent>
    </Card>
  );
}
