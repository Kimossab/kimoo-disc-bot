import Logger from "@/helper/logger";

import { requestSauceNao } from "./request";
import axios from "axios";

jest.mock("axios");
jest.mock("@/helper/logger");

(Logger as jest.Mock).mockImplementation(() => ({
  error: jest.fn(),
}));

describe("Sauce Nao Request", () => {
  it("should log if there's an error", async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce({
      message: "ERROR",
    });

    const logger = new Logger("test");

    await expect(requestSauceNao("SOME_IMAGE", logger)).resolves.toBeNull();

    expect(logger.error).toHaveBeenCalled();
  });

  it("should return the axios response data", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { test: "object" },
    });

    const logger = new Logger("test");

    await expect(requestSauceNao("SOME_IMAGE", logger)).resolves.toEqual({
      test: "object",
    });
  });
});
