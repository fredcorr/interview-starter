import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface IconDefinition {
  viewBox: string;
  /** Filled icons use currentColor as fill; outline icons as stroke. */
  variant: "fill" | "outline";
  content: ReactNode;
}

const ICONS = {
  search: {
    viewBox: "0 0 20 20",
    variant: "outline",
    content: (
      <>
        <circle cx="9" cy="9" r="6" />
        <path d="m13.5 13.5 4 4" />
      </>
    ),
  },
  close: {
    viewBox: "0 0 20 20",
    variant: "outline",
    content: <path d="m5 5 10 10M15 5 5 15" />,
  },
  star: {
    viewBox: "0 0 20 20",
    variant: "fill",
    content: (
      <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.7l5.9-.9L10 1.5z" />
    ),
  },
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICONS;

export interface IconProps {
  name: IconName;
  /** Accessible name. Omit for decorative icons (hidden from assistive tech). */
  label?: string;
  className?: string;
}

export const Icon = ({ name, label, className }: IconProps) => {
  const { viewBox, variant, content }: IconDefinition = ICONS[name];

  return (
    <svg
      viewBox={viewBox}
      focusable="false"
      data-icon={name}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
      className={cn(
        "size-5 shrink-0",
        variant === "fill"
          ? "fill-current"
          : "fill-none stroke-current stroke-2",
        className,
      )}
    >
      {content}
    </svg>
  );
};
