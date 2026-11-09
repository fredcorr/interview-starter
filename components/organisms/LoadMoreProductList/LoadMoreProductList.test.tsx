import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeProductsPage } from "@/mocks/molecules/product";
import { fetchProducts } from "@/utils/fetch-products";
import { LoadMoreProductList } from "./LoadMoreProductList";

jest.mock("@/utils/fetch-products", () => ({
  ...jest.requireActual("@/utils/fetch-products"),
  fetchProducts: jest.fn(),
}));

const mockFetchProducts = jest.mocked(fetchProducts);

function renderList({ initialCount = 20, total = 45, query = "" } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LoadMoreProductList
        query={query}
        initialCount={initialCount}
        total={total}
      >
        {Array.from({ length: initialCount }, (_, index) => (
          <li key={index}>
            <article aria-label={`Server product ${index + 1}`} />
          </li>
        ))}
      </LoadMoreProductList>
    </QueryClientProvider>,
  );
}

describe("LoadMoreProductList", () => {
  beforeEach(() => {
    mockFetchProducts.mockReset();
    mockFetchProducts.mockImplementation(async ({ skip = 0, limit = 20 } = {}) =>
      makeProductsPage(skip, limit, 45),
    );
  });

  it("renders the server items without fetching on mount", () => {
    renderList();

    expect(screen.getAllByRole("listitem")).toHaveLength(20);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Showing 20 of 45 products",
    );
    expect(mockFetchProducts).not.toHaveBeenCalled();
  });

  it("appends the next page on click, focuses it and announces progress", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByRole("button", { name: "Load more products" }));

    expect(
      await screen.findByRole("article", { name: "Product 21" }),
    ).toBeInTheDocument();
    expect(mockFetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, limit: 20 }),
    );
    expect(screen.getAllByRole("article")).toHaveLength(40);
    expect(
      screen.getByRole("article", { name: "Product 21" }),
    ).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Showing 40 of 45 products",
    );
  });

  it("hides the button once every product is loaded", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByRole("button", { name: "Load more products" }));
    await screen.findByRole("article", { name: "Product 21" });
    await user.click(screen.getByRole("button", { name: "Load more products" }));
    await screen.findByRole("article", { name: "Product 45" });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("You've seen all products.")).toBeInTheDocument();
  });

  it("shows an error and lets the user retry", async () => {
    const user = userEvent.setup();
    mockFetchProducts.mockRejectedValueOnce(new Error("Network down"));
    renderList();

    await user.click(screen.getByRole("button", { name: "Load more products" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't load more products",
    );

    await user.click(screen.getByRole("button", { name: "Try again" }));

    const list = screen.getByRole("list");
    expect(
      await within(list).findByRole("article", { name: "Product 21" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("fetches further pages with the active search query", async () => {
    const user = userEvent.setup();
    renderList({ query: "phone" });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Showing 20 of 45 results for “phone”",
    );

    await user.click(screen.getByRole("button", { name: "Load more products" }));
    await screen.findByRole("article", { name: "Product 21" });

    expect(mockFetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ query: "phone", skip: 20 }),
    );
  });

  it("announces when a search has no results", () => {
    renderList({ query: "zzz", initialCount: 0, total: 0 });

    expect(screen.getByRole("status")).toHaveTextContent(
      "No products found for “zzz”.",
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
