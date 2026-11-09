"use client";

import { useId, useRef, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import { cn } from "@/utils/cn";
import { MAX_SEARCH_LENGTH } from "@/utils/search-query";

export interface SearchBarProps {
  value: string;
  onValueChange?: (value: string) => void;
  /** Called on Enter and on clear, so users don't wait for any debounce. */
  onSubmit?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const SearchBar = ({
  value,
  onValueChange,
  onSubmit,
  label = "Search",
  placeholder,
  disabled = false,
  className,
}: SearchBarProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  const handleClear = () => {
    onValueChange?.("");
    onSubmit?.("");
    // The clear button unmounts once empty; keep focus in the field.
    inputRef.current?.focus();
  };

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
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        />
        <Input
          ref={inputRef}
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => onValueChange?.(event.target.value)}
          placeholder={placeholder}
          maxLength={MAX_SEARCH_LENGTH}
          autoComplete="off"
          disabled={disabled}
          className="px-10"
        />
        {value && !disabled && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Clear ${label.toLowerCase()}`}
            onClick={handleClear}
            className="absolute top-0 right-0"
          >
            <Icon name="close" />
          </Button>
        )}
      </div>
    </form>
  );
};
