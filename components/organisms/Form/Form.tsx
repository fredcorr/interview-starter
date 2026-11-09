"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type MouseEvent,
} from "react";
import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { FormField } from "@/components/molecules/FormField";
import { readValues } from "@/lib/forms/form-data";
import { validateField, validateForm } from "@/lib/forms/validate";
import type {
  FieldConfig,
  FieldErrors,
  FormActionState,
  FormValues,
  HiddenValues,
  RawValues,
} from "@/types/form";

export interface FormCopy<F extends readonly FieldConfig[]> {
  submit: string;
  pending: string;
  successTitle: string;
  successMessage: (values: FormValues<F>) => string;
  errorTitle: string;
  errorMessage: (requestId?: string) => string;
  resend: string;
  edit: string;
}

const defaultCopy: FormCopy<readonly FieldConfig[]> = {
  submit: "Submit",
  pending: "Sending request…",
  successTitle: "Request sent",
  successMessage: () => "Thanks, we've received your submission.",
  errorTitle: "Request not sent",
  errorMessage: (requestId) =>
    `Something went wrong and your request wasn't sent. Please try again.${
      requestId ? ` If it keeps happening, quote reference ${requestId}.` : ""
    }`,
  resend: "Resend",
  edit: "Edit request",
};

type Action = (
  previous: FormActionState,
  formData: FormData,
) => Promise<FormActionState>;

export interface FormProps<F extends readonly FieldConfig[]> {
  /** Prefix for element ids; the error summary links to `${id}-${field}`. */
  id: string;
  /** Accessible name of the form. */
  label: string;
  fields: F;
  action: Action;
  hiddenValues: HiddenValues<F>;
  copy?: Partial<FormCopy<F>>;
}

const IDLE: FormActionState = { status: "idle" };

const plural = (count: number) => (count === 1 ? "field" : "fields");

/**
 * Renders any form from its field config. Validates each field on blur and
 * the whole form on submit with the same rules the server uses, shows an
 * error summary, an accessible pending state, and the result with resend.
 */
export const Form = <F extends readonly FieldConfig[]>({
  id,
  label,
  fields,
  action,
  hiddenValues,
  copy: copyOverrides,
}: FormProps<F>) => {
  const copy = { ...defaultCopy, ...copyOverrides } as FormCopy<F>;
  const hidden: Record<string, string> = hiddenValues;

  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const lastData = useRef<FormData | null>(null);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [summaryRequest, setSummaryRequest] = useState(0);
  const [submitted, setSubmitted] = useState<{
    raw: RawValues;
    values: FormValues<F>;
  } | null>(null);
  const [dismissed, setDismissed] = useState<FormActionState | null>(null);
  const [editRequest, setEditRequest] = useState(0);

  const [state, dispatch, pending] = useActionState<FormActionState, FormData>(
    async (previous, formData) => {
      let next: FormActionState;
      try {
        next = await action(previous, formData);
      } catch {
        next = { status: "error" };
      }
      if (next.fieldErrors) {
        setErrors(next.fieldErrors);
        setSummaryRequest((count) => count + 1);
      }
      return next;
    },
    IDLE,
  );

  const result =
    state.status !== "idle" && !state.fieldErrors && state !== dismissed
      ? state
      : null;
  const showResult = result !== null;

  const fieldId = (name: string) => `${id}-${name}`;
  const currentValues = () =>
    readValues(fields, new FormData(formRef.current ?? undefined));

  // Focus follows the outcome so keyboard and screen reader users land on it.
  useEffect(() => {
    if (summaryRequest > 0) summaryRef.current?.focus();
  }, [summaryRequest]);
  useEffect(() => {
    if (showResult) resultHeadingRef.current?.focus();
  }, [showResult, state]);
  useEffect(() => {
    if (editRequest === 0) return;
    formRef.current
      ?.querySelector<HTMLElement>("input:not([type=hidden]),select,textarea")
      ?.focus();
  }, [editRequest]);

  const send = (formData: FormData) => {
    lastData.current = formData;
    startTransition(() => dispatch(formData));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    const raw = readValues(fields, formData);
    const validation = validateForm(fields, raw);
    if (!validation.ok) {
      setErrors(validation.fieldErrors);
      setSummaryRequest((count) => count + 1);
      return;
    }
    setErrors({});
    setSubmitted({ raw, values: validation.values });
    send(formData);
  };

  const revalidate = (name: string) => {
    const error = validateField(fields, name, currentValues());
    setErrors((previous) => {
      const next = { ...previous };
      if (error) next[name] = error;
      else delete next[name];
      return next;
    });
  };

  const onBlur = (event: FocusEvent<HTMLElement & { name: string }>) =>
    revalidate(event.target.name);
  const onChange = (event: FormEvent<HTMLElement & { name: string }>) => {
    const { name } = event.currentTarget;
    if (errors[name]) revalidate(name);
  };

  const onEdit = () => {
    if (pending) return;
    setDismissed(state);
    setSummaryRequest(0);
    setEditRequest((count) => count + 1);
  };

  const onResend = () => {
    if (!pending && lastData.current) send(lastData.current);
  };

  const focusField = (event: MouseEvent<HTMLAnchorElement>, name: string) => {
    event.preventDefault();
    document.getElementById(fieldId(name))?.focus();
  };

  const errorList = fields.filter((field) => errors[field.name]);

  return (
    <div className="flex flex-col gap-6">
      {/* Always mounted, so the change to "sending" is announced. */}
      <p aria-live="polite" className="sr-only">
        {pending ? "Sending your request…" : ""}
      </p>

      {showResult ? (
        <div
          role={result.status === "success" ? "status" : "alert"}
          className={
            result.status === "success"
              ? "flex flex-col gap-4 rounded-lg border border-success bg-success-surface p-4"
              : "flex flex-col gap-4 rounded-lg border border-danger bg-danger-surface p-4"
          }
        >
          <h3
            ref={resultHeadingRef}
            tabIndex={-1}
            className="text-lg font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            {result.status === "success" ? copy.successTitle : copy.errorTitle}
          </h3>
          <p className="text-foreground">
            {result.status === "success" && submitted
              ? copy.successMessage(submitted.values)
              : copy.errorMessage(result.requestId)}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button loading={pending} onClick={onResend}>
              {pending && <Spinner />}
              {pending ? copy.pending : copy.resend}
            </Button>
            <Button variant="ghost" onClick={onEdit} aria-disabled={pending || undefined}>
              {copy.edit}
            </Button>
          </div>
        </div>
      ) : (
        <form
          ref={formRef}
          aria-label={label}
          aria-busy={pending || undefined}
          noValidate
          onSubmit={onSubmit}
          className="flex flex-col gap-6"
        >
          {summaryRequest > 0 && errorList.length > 0 && (
            <div
              ref={summaryRef}
              role="alert"
              tabIndex={-1}
              aria-labelledby={`${id}-summary-title`}
              className="flex flex-col gap-2 rounded-lg border-2 border-danger bg-danger-surface p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <h3 id={`${id}-summary-title`} className="font-semibold text-foreground">
                Fix {errorList.length} {plural(errorList.length)} to send your
                request
              </h3>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-danger">
                {errorList.map((field) => (
                  <li key={field.name}>
                    {field.type === "hidden" ? (
                      errors[field.name]
                    ) : (
                      <a
                        href={`#${fieldId(field.name)}`}
                        onClick={(event) => focusField(event, field.name)}
                        className="font-medium underline underline-offset-2"
                      >
                        {errors[field.name]}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div inert={pending} className="flex flex-col gap-5">
            {fields.map((field) => (
              <FormField
                key={field.name}
                id={fieldId(field.name)}
                field={field}
                error={errors[field.name]}
                defaultValue={
                  field.type === "hidden"
                    ? hidden[field.name]
                    : submitted?.raw[field.name]
                }
                onBlur={onBlur}
                onChange={onChange}
              />
            ))}
          </div>

          <Button type="submit" loading={pending} className="self-start">
            {pending && <Spinner />}
            {pending ? copy.pending : copy.submit}
          </Button>
        </form>
      )}
    </div>
  );
};
