"use client";

import { GroupIcon } from "lucide-react";
import type React from "react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface Group {
  name: string;
  icon: string;
}

interface MyGroupsProps {
  groups: Group[];
}

const MyGroups: React.FC<MyGroupsProps & { isCollapsed: boolean }> = ({
  groups,
  isCollapsed
}) => (
  <Card
    className={`bg-card transition-all duration-300 ease-in-out ${isCollapsed ? "w-12 overflow-hidden" : "w-full"}`}
  >
    <CardContent
      className={`${isCollapsed ? "flex justify-center p-2" : "p-4"}`}
    >
      {isCollapsed ? (
        <GroupIcon className="h-6 w-6 text-muted-foreground" />
      ) : (
        <>
          <CardTitle className="mb-4 flex items-center font-semibold text-muted-foreground text-sm uppercase">
            My Groups
          </CardTitle>
          <ul className="space-y-3">
            {groups.map((group, index) => (
              <li key={index} className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-lg">
                  {group.icon}
                </div>
                <span className="font-medium text-foreground text-sm">
                  {group.name}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </CardContent>
  </Card>
);

export default MyGroups;
