import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

// @ts-expect-error
export function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-4 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h2 className="mb-2 font-semibold text-lg">Something went wrong</h2>
      <p className="mb-4 text-muted-foreground text-sm">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}
