"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex items-center gap-1 border-b border-border/40 pb-0",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative px-4 py-2 text-xs uppercase tracking-[0.18em] font-medium text-muted-foreground transition-colors",
        "hover:text-foreground",
        "data-[active]:text-gold",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm",
        // bottom border indicator drawn as an absolute pseudo-element via after
        "after:absolute after:inset-x-0 after:-bottom-px after:h-px after:rounded-full after:bg-gold after:scale-x-0 after:transition-transform after:duration-200",
        "data-[active]:after:scale-x-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("pt-6 focus-visible:outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
