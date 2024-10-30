import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="font-bold text-4xl">404</h1>
        <h2 className="text-muted-foreground text-xl">
          Oops! This page doesn't exist.
        </h2>
        <Link href="/">
          <Button variant="default">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
