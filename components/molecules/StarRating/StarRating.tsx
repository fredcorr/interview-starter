import { Icon } from "@/components/atoms/Icon";
import { cn } from "@/utils/cn";

const MAX_RATING = 5;

export interface StarRatingProps {
  /** Rating from 0 to 5; fractional values render partially filled stars. */
  rating: number;
  className?: string;
}

const StarRow = ({ className }: { className: string }) => (
  <span className={cn("flex w-max gap-0.5", className)}>
    {Array.from({ length: MAX_RATING }, (_, index) => (
      <Icon key={index} name="star" className="size-4" />
    ))}
  </span>
);

export const StarRating = ({ rating, className }: StarRatingProps) => {
  const clamped = Math.min(Math.max(rating, 0), MAX_RATING);

  return (
    <span
      role="img"
      aria-label={`Rated ${clamped.toFixed(1)} out of ${MAX_RATING}`}
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
};
