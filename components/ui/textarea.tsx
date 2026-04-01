import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[6.5rem] w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-sm leading-6 text-[var(--text-primary)] shadow-sm transition-[border-color,box-shadow] placeholder:text-[var(--text-secondary)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

export { Textarea };
