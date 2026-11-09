import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("only emits the latest value once it settles", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: "abc" });
    act(() => jest.advanceTimersByTime(200));

    expect(result.current).toBe("a");

    act(() => jest.advanceTimersByTime(100));

    expect(result.current).toBe("abc");
  });
});
