// Path: frontend/components/ui/icon.tsx

import React from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/faces/video-player/lib/utils";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, className, strokeWidth = 2 }: IconProps) {
  const IconComponent = (LucideIcons as any)[
    name.split("-").map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join("")
  ];

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={cn(className)}
    />
  );
}