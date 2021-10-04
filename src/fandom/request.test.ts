import axios from "axios";
import { requestFandom } from "./request";

jest.mock("axios", () => ({
  get: jest.fn().mockReturnValue({ data: [] }),
}));

describe("Fandom request", () => {
  it("should make a request", async () => {
    await requestFandom("fandom", "query");

    expect(axios.get).toHaveBeenCalledWith(
      `https://fandom.fandom.com/api.php?action=opensearch&search=query`
    );
  });
});
