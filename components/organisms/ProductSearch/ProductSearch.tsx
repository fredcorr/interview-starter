"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { SearchBar } from "@/components/molecules/SearchBar";
import { useDebounce } from "@/hooks/use-debounce";
import { parseSearchQuery, SEARCH_PARAM } from "@/utils/search-query";

export const PRODUCT_SEARCH_LABEL = "Search products";

/**
 * Controlled search box that writes a debounced `?q=` to the URL. The page
 * reads `q` on the server, so results come from the cached product data.
 */
export const ProductSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = parseSearchQuery(searchParams.get(SEARCH_PARAM));

  const [value, setValue] = useState(urlQuery);
  const debouncedValue = useDebounce(value);

  const commit = useCallback(
    (nextValue: string) => {
      const query = parseSearchQuery(nextValue);
      if (query === urlQuery) return;

      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set(SEARCH_PARAM, query);
      else params.delete(SEARCH_PARAM);
      const search = params.toString();

      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams, urlQuery],
  );

  // Only a settled (debounced) value writes to the URL; never every keystroke.
  const onDebouncedChange = useEffectEvent((next: string) => commit(next));
  useEffect(() => {
    onDebouncedChange(debouncedValue);
  }, [debouncedValue]);

  return (
    <SearchBar
      label={PRODUCT_SEARCH_LABEL}
      placeholder="Try “phone” or “lipstick”"
      value={value}
      onValueChange={setValue}
      onSubmit={commit}
    />
  );
};
