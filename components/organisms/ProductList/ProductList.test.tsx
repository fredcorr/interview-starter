import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeProductsPage } from "@/mocks/molecules/product";
import { fetchProducts } from "@/utils/fetch-products";
import { ProductList } from "./ProductList";

jest.mock("@/app/actions/submit-form", () => ({
  submitFormAction: jest.fn(),
}));

jest.mock("@/utils/fetch-products", () => ({
  ...jest.requireActual("@/utils/fetch-products"),
  fetchProducts: jest.fn(),
}));

const mockFetchProducts = jest.mocked(fetchProducts);
const TOTAL = 45;

const renderList = ({ query = "", total = TOTAL } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProductList query={query} initialPage={makeProductsPage(0, 20, total)} />
    </QueryClientProvider>,
  );
};

const loadMoreButton = () =>
  screen.getByRole("button", { name: "Load more products" });

describe("ProductList", () => {
  beforeEach(() => {
    mockFetchProducts.mockReset();
    mockFetchProducts.mockImplementation(
      async ({ skip = 0, limit = 20 } = {}) =>
        makeProductsPage(skip, limit, TOTAL),
    );
  });

  it("renders the first page without fetching on mount", () => {
    renderList();

    expect(screen.getAllByRole("article")).toHaveLength(20);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Showing 20 of 45 products",
    );
    expect(mockFetchProducts).not.toHaveBeenCalled();
  });

  it("appends the next page on click, focuses it and announces progress", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(loadMoreButton());

    expect(
      await screen.findByRole("button", { name: "Product 21" }),
    ).toHaveFocus();
    expect(mockFetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, limit: 20 }),
    );
    expect(screen.getAllByRole("article")).toHaveLength(40);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Showing 40 of 45 products",
    );
  });

  it("only renders the load more button while products remain", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(loadMoreButton());
    await screen.findByRole("article", { name: "Product 21" });
    await user.click(loadMoreButton());
    await screen.findByRole("article", { name: "Product 45" });

    expect(
      screen.queryByRole("button", { name: "Load more products" }),
    ).not.toBeInTheDocument();
  });

  it("shows an error and lets the user retry", async () => {
    const user = userEvent.setup();
    mockFetchProducts.mockRejectedValueOnce(new Error("Network down"));
    renderList();

    await user.click(loadMoreButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't load more products",
    );

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("article", { name: "Product 21" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("fetches further pages with the active search query", async () => {
    const user = userEvent.setup();
    renderList({ query: "phone" });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Showing 20 of 45 results for “phone”",
    );

    await user.click(loadMoreButton());
    await screen.findByRole("article", { name: "Product 21" });

    expect(mockFetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ query: "phone", skip: 20 }),
    );
  });

  it("announces when a search has no results", () => {
    renderList({ query: "zzz", total: 0 });

    expect(screen.getByRole("status")).toHaveTextContent(
      "No products found for “zzz”.",
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("opens the quote form for the clicked product and returns focus on close", async () => {
    const user = userEvent.setup();
    renderList();
    const card = screen.getByRole("button", { name: "Product 3" });

    await user.click(card);

    const dialog = screen.getByRole("dialog", { name: "Request a quote" });
    expect(dialog).toHaveAccessibleDescription("Product 3");
    expect(dialog.querySelector("input[name=productId]")).toHaveValue("3");

    await user.click(within(dialog).getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(card).toHaveFocus();
  });
});
