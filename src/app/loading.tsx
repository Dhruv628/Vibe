import { Loader2Icon } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Gradient Background - Matches ProjectView */}
      {/* <div className="fixed inset-0 -z-10 h-full w-full">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-linear-to-br dark:from-[#1a1625] dark:via-[#2d1b3d] dark:to-[#1a1625]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent dark:from-purple-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-purple-200/20 via-transparent to-transparent dark:from-pink-500/10" />
      </div> */}

      <div className="flex flex-col items-center gap-4 z-10">
        <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <Loader2Icon className="size-10 text-primary animate-spin relative z-10" />
        </div>
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Loading Vibe...
        </p>
      </div>
    </div>
  );
}