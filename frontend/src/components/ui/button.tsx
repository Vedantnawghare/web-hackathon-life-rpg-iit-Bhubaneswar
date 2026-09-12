import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "gold" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 shadow-sm",
      secondary: "bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600",
      outline: "border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white",
      ghost: "text-slate-300 hover:bg-slate-800/60 hover:text-white",
      gold: "bg-amber-600 text-amber-950 font-semibold hover:bg-amber-500 border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
      destructive: "bg-rose-900/80 text-rose-100 hover:bg-rose-800 border border-rose-700",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-md px-8 text-base",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
