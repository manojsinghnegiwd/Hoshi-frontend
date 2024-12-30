'use client';

import * as React from "react";
import { Textarea } from "./textarea";
import { cn } from "@/lib/utils";

export interface AutoExpandingTextareaProps
  extends React.ComponentProps<typeof Textarea> {
  maxRows?: number;
}

const AutoExpandingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoExpandingTextareaProps
>(({ className, maxRows = 5, onChange, ...props }, ref) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useImperativeHandle(ref, () => textareaRef.current!);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const maxHeight = lineHeight * maxRows;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    
    // Set the new height
    textarea.style.height = `${newHeight}px`;
    
    // Call the original onChange handler
    onChange?.(event);
  };

  return (
    <Textarea
      ref={textareaRef}
      className={cn("resize-none overflow-y-auto", className)}
      onChange={handleChange}
      rows={1}
      {...props}
    />
  );
});

AutoExpandingTextarea.displayName = "AutoExpandingTextarea";

export { AutoExpandingTextarea }; 