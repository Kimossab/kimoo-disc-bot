import { downloadFile } from "@/helper/common";
import Logger from "@/helper/logger";

import { requestTraceMoe } from "./request";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

jest.mock("axios");
jest.mock("fs");
jest.mock("form-data");
jest.mock("@/helper/logger");
jest.mock("@/helper/common");

(Logger as jest.Mock).mockImplementation(() => ({
  error: jest.fn(),
}));
(FormData as unknown as jest.Mock).mockImplementation(() => ({
  append: jest.fn(),
  getHeaders: jest.fn().mockReturnValue([]),
}));
(downloadFile as jest.Mock).mockReturnValue({});

describe("Sauce Nao Request", () => {
  it("should log if there's an error", async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce({
      message: "ERROR",
    });

    const logger = new Logger("test");

    await expect(requestTraceMoe("SOME_IMAGE", logger)).resolves.toBeNull();

    expect(logger.error).toHaveBeenCalled();
  });

  it("should return the axios response data", async () => {
    (axios.post as jest.Mock).mockResolvedValueOnce({
      data: { test: "object" },
    });
    (fs.createReadStream as jest.Mock).mockResolvedValueOnce(jest.fn());

    const logger = new Logger("test");

    await expect(requestTraceMoe("SOME_IMAGE", logger)).resolves.toEqual({
      test: "object",
    });
  });
});
