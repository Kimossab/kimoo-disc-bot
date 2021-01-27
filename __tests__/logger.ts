import Logger from "../src/helper/logger";

describe("Logger", () => {
  it("print stuff", () => {
    const _logger = new Logger("test");

    _logger.log("hello world", { a: 1, b: { c: 2 } });
    _logger.error("error world", { a: 1, b: { c: 2 } });
  });
});
