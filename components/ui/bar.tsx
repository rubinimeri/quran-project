"use client";
import { cn } from "@/lib/utils";

export function Bar({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-md", className)} />;
}
