import { cn } from "@/lib/utils";
import React from "react";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-800/60", className)}
      {...props}
    />
  );
}
