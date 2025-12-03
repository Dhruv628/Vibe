import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for ProjectHeader component
 * Matches the layout and dimensions of the actual header
 */
export function ProjectHeaderLoader() {
  return (
    <div className="p-2 flex justify-between items-center border-b h-[52px]">
      <div className="flex items-center gap-2 pl-2">
        {/* Logo skeleton */}
        <Skeleton className="h-[18px] w-[18px] rounded" />
        {/* Project name skeleton */}
        <Skeleton className="h-4 w-32" />
        {/* Dropdown icon skeleton */}
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
  );
}
