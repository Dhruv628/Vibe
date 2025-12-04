import * as React from "react"
import { cn } from "@/lib/utils"

export interface CustomButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
  variant?: "default" | "secondary" | "outline" | "ghost" | "muted"
  size?: "default" | "sm" | "lg" | "icon"
}

const CustomButton = React.forwardRef<HTMLDivElement, CustomButtonProps>(
  ({ className, disabled = false, variant = "default", size = "default", onClick, children, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      onClick?.(e)
    }

    const variantStyles = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      muted: "bg-muted-foreground border text-primary-foreground",
    }

    const sizeStyles = {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3 py-1.5",
      lg: "h-10 px-6 py-2.5",
      icon: "size-8",
    }

    return (
      <div
        ref={ref}
        tabIndex={0}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-all shrink-0",
          sizeStyles[size],
          disabled
            ? "opacity-50 cursor-not-allowed bg-muted-foreground border text-primary-foreground"
            : cn(variantStyles[variant], "cursor-pointer"),
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CustomButton.displayName = "CustomButton"

export { CustomButton }
