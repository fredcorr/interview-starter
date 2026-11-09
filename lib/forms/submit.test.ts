/** @jest-environment node */
import { FORMS_ENDPOINT, submitForm } from "./submit";

const quoteData = (overrides: Record<string, string> = {}) => {
  const data = new FormData();
  const values = {
    productId: "1",
    companyName: "Acme Ltd",
    email: "jo@acme.com",
    quantity: "10",
    deliveryDate: "2026-11-20",
    notes: "Gift wrap please",
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};

const NOW = new Date(Date.UTC(2026, 10, 9, 12));

const logLines = (spy: jest.SpyInstance) =>
  spy.mock.calls.map(([line]) => JSON.parse(String(line)));

describe("submitForm", () => {
  let warn: jest.SpyInstance;
  let info: jest.SpyInstance;
  let error: jest.SpyInstance;
  const fetchMock = jest.fn<Promise<Response>, Parameters<typeof fetch>>();

  beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    info = jest.spyOn(console, "info").mockImplementation(() => {});
    error = jest.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterEach(() => jest.restoreAllMocks());

  it("rejects and logs an unknown form id without calling the API", async () => {
    const result = await submitForm("nope", new FormData());

    expect(result).toEqual({
      status: "error",
      requestId: expect.any(String),
    });
    expect(logLines(warn)).toEqual([
      expect.objectContaining({
        level: "warn",
        event: "form.unknown_id",
        formId: "nope",
        requestId: result.requestId,
      }),
    ]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("re-validates on the server and logs which rules failed, never the values", async () => {
    const result = await submitForm(
      "quote",
      quoteData({ productId: "abc", email: "secret@", quantity: "500" }),
      { now: NOW },
    );

    expect(result).toEqual({
      status: "error",
      requestId: expect.any(String),
      fieldErrors: {
        productId: "This product can't be quoted. Please reload the page.",
        email: "Enter a valid email address, like name@company.com",
        quantity: "Quantity must be between 1 and 100",
      },
    });
    const [line] = logLines(warn);
    expect(line).toMatchObject({
      event: "form.validation_failed",
      formId: "quote",
      requestId: result.requestId,
      failedRules: { productId: "pattern", email: "email", quantity: "range" },
    });
    const raw = String(warn.mock.calls[0][0]);
    expect(raw).not.toContain("secret@");
    expect(raw).not.toContain("Acme");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated values with the form id and logs success", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));

    const result = await submitForm("quote", quoteData(), { now: NOW });

    expect(result).toEqual({ status: "success", requestId: expect.any(String) });
    expect(fetchMock).toHaveBeenCalledWith(
      FORMS_ENDPOINT,
      expect.objectContaining({ method: "POST" }),
    );
    const init = fetchMock.mock.calls[0][1];
    expect(JSON.parse(String(init?.body))).toEqual({
      formId: "quote",
      values: {
        productId: "1",
        companyName: "Acme Ltd",
        email: "jo@acme.com",
        quantity: 10,
        deliveryDate: "2026-11-20",
        notes: "Gift wrap please",
      },
    });
    expect(logLines(info)).toEqual([
      expect.objectContaining({
        event: "form.submitted",
        requestId: result.requestId,
        productId: "1",
      }),
    ]);
  });

  it("returns an error and logs the upstream status when the API fails", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

    const result = await submitForm("quote", quoteData(), { now: NOW });

    expect(result).toEqual({ status: "error", requestId: expect.any(String) });
    expect(logLines(error)).toEqual([
      expect.objectContaining({ event: "form.submit_failed", status: 503 }),
    ]);
  });

  it("returns an error and logs the reason when the request throws", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const result = await submitForm("quote", quoteData(), { now: NOW });

    expect(result.status).toBe("error");
    expect(logLines(error)).toEqual([
      expect.objectContaining({
        event: "form.submit_failed",
        error: "fetch failed",
      }),
    ]);
  });
});
