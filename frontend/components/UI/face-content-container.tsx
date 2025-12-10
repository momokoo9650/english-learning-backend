// Path: frontend/components/ui/face-content-container.tsx

import React from "react";
import { cn } from "@/faces/video-player/lib/utils";

interface FaceContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function FaceContentContainer({
  children,
  className,
}: FaceContentContainerProps) {
  return (
    <div className={cn("w-full mx-auto px-4", className)}>
      {children}
    </div>
  );
}