import { Spinner } from "@/components/ui/spinner";

/**
 * Full-page loader with spinner and text
 * Used for page-level loading states
 */
export function PageLoader({ text = "Loading project..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      </div>
    </div>
  );
}
