"use client";

import {
  useEffect,
  useId,
  useRef,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { useFocusTrap } from "@/hooks/use-focus-trap";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
}

type DialogProps = Omit<ModalProps, "open"> & { children: ReactNode };

/**
 * Native modal dialog: `showModal()` makes the rest of the page inert and
 * puts the dialog in the top layer. Esc fires `cancel`; we hand closing to the
 * owner so its state stays the source of truth. Mounted only while open, so
 * the wrapped component starts fresh every time.
 */
const Dialog = ({ onClose, title, description, children }: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();

    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  useFocusTrap(ref, true);

  // A click on the dialog element itself (not its content) is the backdrop.
  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={onBackdropClick}
      className="m-auto max-h-full w-lg max-w-full overflow-y-auto rounded-xl border border-border bg-surface p-0 text-foreground backdrop:bg-overlay"
    >
      <div className="flex flex-col gap-6 p-6">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-xl font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={onClose}
            className="-mt-2 -mr-2"
          >
            <Icon name="close" />
          </Button>
        </header>
        {children}
      </div>
    </dialog>
  );
};

/** Wraps any component in an accessible modal dialog. */
export const withModal = <P extends object>(Component: ComponentType<P>) => {
  const Modal = ({
    open,
    onClose,
    title,
    description,
    ...props
  }: ModalProps & P) => {
    if (!open) return null;
    return (
      <Dialog onClose={onClose} title={title} description={description}>
        {/* The rest is exactly P once the modal's own props are taken out. */}
        <Component {...(props as unknown as P)} />
      </Dialog>
    );
  };
  Modal.displayName = `withModal(${Component.displayName ?? Component.name})`;
  return Modal;
};
