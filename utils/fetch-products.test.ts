import { fetchProducts } from "./fetch-products";

function mockFetchResponse(body: unknown, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  });
}

describe("fetchProducts", () => {
  it("requests a page with limit, skip and the card fields", async () => {
    mockFetchResponse({ products: [], total: 0, skip: 20, limit: 20 });

    await fetchProducts({ skip: 20, limit: 20 });

    const url = new URL(jest.mocked(global.fetch).mock.calls[0][0] as string);
    expect(url.searchParams.get("limit")).toBe("20");
    expect(url.searchParams.get("skip")).toBe("20");
    expect(url.searchParams.get("select")).toBe(
      "title,thumbnail,brand,price,rating",
    );
  });

  it("returns validated products and strips unknown fields", async () => {
    mockFetchResponse({
      products: [
        { id: 1, title: "A", thumbnail: "t", price: 1, rating: 4, extra: true },
      ],
      total: 1,
      skip: 0,
      limit: 20,
    });

    const page = await fetchProducts();

    expect(page.products[0]).toEqual({
      id: 1,
      title: "A",
      thumbnail: "t",
      price: 1,
      rating: 4,
    });
  });

  it("throws on HTTP errors", async () => {
    mockFetchResponse({}, false, 500);

    await expect(fetchProducts()).rejects.toThrow("HTTP 500");
  });

  it("throws on a malformed response", async () => {
    mockFetchResponse({ products: "nope" });

    await expect(fetchProducts()).rejects.toThrow();
  });
});
