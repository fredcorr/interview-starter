import { cn } from "@/utils/cn";

const MEDIA = {
  square: "aspect-square",
  video: "aspect-video",
} as const;

/** Varied widths so stacked lines read as text, not bars. */
const LINE_WIDTHS = ["w-4/5", "w-1/3", "w-1/2", "w-1/4"] as const;

export interface SkeletonProps {
  /** Aspect ratio of the image placeholder; "none" leaves it out. */
  media?: keyof typeof MEDIA | "none";
  /** Number of text-line placeholders under the media. */
  lines?: number;
  /** Frame (border, radius, background) comes from the caller. */
  className?: string;
}

const Block = ({ className }: { className: string }) => (
  <div className={cn("rounded bg-skeleton", className)} />
);

/**
 * Loading placeholder: an optional image block followed by lines of text.
 * Decorative, so hidden from assistive tech; announce loading elsewhere.
 */
export const Skeleton = ({
  media = "square",
  lines = 3,
  className,
}: SkeletonProps) => (
  <div
    aria-hidden="true"
    data-testid="skeleton"
    className={cn(
      "flex animate-pulse flex-col overflow-hidden motion-reduce:animate-none",
      className,
    )}
  >
    {media !== "none" && (
      <div data-skeleton="media" className={cn("bg-skeleton", MEDIA[media])} />
    )}
    {lines > 0 && (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: lines }, (_, index) => (
          <div key={index} data-skeleton="line">
            <Block
              className={cn(
                index === 0 ? "h-4" : "h-3",
                LINE_WIDTHS[index % LINE_WIDTHS.length],
              )}
            />
          </div>
        ))}
      </div>
    )}
  </div>
);
