// Path: frontend/components/ui/text-content.tsx

import React from "react";
import { cn } from "@/faces/video-player/lib/utils";

interface TextContentProps {
  content: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function TextContent({
  content,
  className,
  as: Component = "div",
}: TextContentProps) {
  return (
    <Component
      className={cn(className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}