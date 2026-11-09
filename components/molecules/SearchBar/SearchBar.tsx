"use client";

import { useId, type FormEvent } from "react";
import { Input } from "@/components/atoms/Input";
import { cn } from "@/utils/cn";
import { MAX_SEARCH_LENGTH } from "@/utils/search-query";

export interface SearchBarProps {
  value: string;
  onValueChange?: (value: string) => void;
  /** Called on Enter, so users don't have to wait for the debounce. */
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  /** Shows a "Searching…" hint while results update. */
  pending?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SearchBar({
  value,
  onValueChange,
  onSubmit,
  label = "Search",
  placeholder,
  pending = false,
  disabled = false,
  className,
}: SearchBarProps) {
  const inputId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(value);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-2", className)}
    >
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 fill-none stroke-muted stroke-2"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="m13.5 13.5 4 4" strokeLinecap="round" />
        </svg>
        <Input
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          placeholder={placeholder}
          maxLength={MAX_SEARCH_LENGTH}
          autoComplete="off"
          disabled={disabled}
          className="pl-10"
        />
      </div>
      <p className={cn("min-h-5 text-sm text-muted", !pending && "invisible")}>
        Searching…
      </p>
    </form>
  );
}
