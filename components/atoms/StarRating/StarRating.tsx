import { cn } from "@/utils/cn";

const MAX_RATING = 5;
const STAR_PATH =
  "M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.7l5.9-.9L10 1.5z";

export interface StarRatingProps {
  /** Rating from 0 to 5; fractional values render partially filled stars. */
  rating: number;
  className?: string;
}

function StarRow({ className }: { className: string }) {
  return (
    <span className={cn("flex w-max gap-0.5", className)}>
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          className="size-4 shrink-0 fill-current"
          aria-hidden="true"
          focusable="false"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

export function StarRating({ rating, className }: StarRatingProps) {
  const clamped = Math.min(Math.max(rating, 0), MAX_RATING);
  const label = `Rated ${clamped.toFixed(1)} out of ${MAX_RATING}`;

  return (
    <span
      role="img"
      aria-label={label}
      className={cn("relative inline-flex w-fit self-start", className)}
    >
      <StarRow className="text-rating-empty" />
      <span
        data-testid="star-rating-fill"
        className="absolute inset-y-0 left-0 overflow-hidden"
        // Width is data-driven (percentage of five stars), not a design value.
        style={{ width: `${(clamped / MAX_RATING) * 100}%` }}
      >
        <StarRow className="text-rating" />
      </span>
    </span>
  );
}
