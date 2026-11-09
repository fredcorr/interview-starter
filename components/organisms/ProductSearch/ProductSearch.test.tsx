import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductSearch } from "./ProductSearch";

const mockReplace = jest.fn();
const mockRouter = { replace: mockReplace };
let mockSearchParams = new URLSearchParams();

// Stable references, like Next's own hooks.
jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => mockSearchParams,
}));

function setup(search = "") {
  mockSearchParams = new URLSearchParams(search);
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<ProductSearch />);
  return {
    user,
    input: screen.getByRole("searchbox", { name: "Search products" }),
  };
}

describe("ProductSearch", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockReplace.mockReset();
  });
  afterEach(() => jest.useRealTimers());

  it("starts from the q param in the URL", () => {
    const { input } = setup("q=laptop");

    expect(input).toHaveValue("laptop");
  });

  it("updates the URL once, after typing settles", async () => {
    const { user, input } = setup();

    await user.type(input, "phone");
    expect(mockReplace).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(300));

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/?q=phone", { scroll: false });
  });

  it("commits immediately on Enter", async () => {
    const { user, input } = setup();

    await user.type(input, "phone{Enter}");

    expect(mockReplace).toHaveBeenCalledWith("/?q=phone", { scroll: false });
  });

  it("removes q when the search is cleared", async () => {
    const { user, input } = setup("q=phone");

    await user.clear(input);
    act(() => jest.advanceTimersByTime(300));

    expect(mockReplace).toHaveBeenCalledWith("/", { scroll: false });
  });
});
