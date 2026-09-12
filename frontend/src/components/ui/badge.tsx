import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "gold" | "crimson" | "emerald" | "amethyst";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-800 text-slate-200 border-slate-700",
    secondary: "bg-slate-700/80 text-slate-300 border-slate-600",
    outline: "text-slate-300 border-slate-700",
    gold: "bg-amber-950/80 text-amber-300 border-amber-500/40",
    crimson: "bg-rose-950/80 text-rose-300 border-rose-500/40",
    emerald: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40",
    amethyst: "bg-purple-950/80 text-purple-300 border-purple-500/40",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
