import { useEffect, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const focusableIn = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.closest("[inert]") && !element.hidden,
  );

/**
 * Keeps keyboard focus inside `ref` while `active`: focuses the first
 * focusable element, wraps Tab / Shift+Tab, skips inert content, and puts
 * focus back where it was when the trap is released.
 */
export const useFocusTrap = (
  ref: RefObject<HTMLElement | null>,
  active: boolean,
) => {
  useEffect(() => {
    const container = ref.current;
    if (!active || !container) return;

    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    focusableIn(container)[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = focusableIn(container);
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }
      const current = elements.indexOf(document.activeElement as HTMLElement);
      const step = event.shiftKey ? -1 : 1;
      const next =
        current === -1
          ? event.shiftKey
            ? elements.length - 1
            : 0
          : (current + step + elements.length) % elements.length;
      event.preventDefault();
      elements[next].focus();
    };

    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      if (previous?.isConnected) previous.focus();
    };
  }, [ref, active]);
};
