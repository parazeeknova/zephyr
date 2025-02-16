import { Button } from '@zephyr/ui/shadui/button';
import { Sheet, SheetContent, SheetTrigger } from '@zephyr/ui/shadui/sheet';
// @ts-expect-error - lucide-react is not typed
import { Menu } from 'lucide-react';
import type React from 'react';

interface MobileSidebarToggleProps {
  children: React.ReactNode;
}

export function MobileSidebarToggle({ children }: MobileSidebarToggleProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-16 left-4 z-50 h-12 w-12 rounded-full border-orange-500/20 bg-orange-500/10 backdrop-blur-sm hover:bg-orange-500/20 md:hidden"
        >
          <Menu className="h-6 w-6 text-orange-500" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        {children}
      </SheetContent>
    </Sheet>
  );
}
