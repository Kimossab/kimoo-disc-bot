import Pagination from "../src/helper/pagination";

describe("Pagination", () => {
  it("Callback Check", () => {
    let run = 1;

    const check1 = (
      channel: string,
      message: string,
      data: string,
      page: number,
      total: number
    ) => {
      expect(channel).toEqual("123456789");
      expect(message).toEqual("12345");
      expect(total).toEqual(3);

      if (run === 1) {
        expect(data).toEqual("b");
        expect(page).toEqual(2);
      } else if (run === 2) {
        expect(data).toEqual("c");
        expect(page).toEqual(3);
      } else if (run === 3) {
        expect(data).toEqual("a");
        expect(page).toEqual(1);
      } else if (run === 4) {
        expect(data).toEqual("c");
        expect(page).toEqual(3);
      } else if (run === 5) {
        expect(data).toEqual("b");
        expect(page).toEqual(2);
      } else if (run === 6) {
        expect(data).toEqual("a");
        expect(page).toEqual(1);
      }
    };

    const check2 = (
      channel: string,
      message: string,
      data: number,
      page: number,
      total: number
    ) => {
      expect(channel).toEqual("987654321");
      expect(message).toEqual("54321");
      expect(total).toEqual(5);

      if (run === 1) {
        expect(data).toEqual(2);
        expect(page).toEqual(2);
      } else if (run === 2) {
        expect(data).toEqual(3);
        expect(page).toEqual(3);
      } else if (run === 3) {
        expect(data).toEqual(4);
        expect(page).toEqual(4);
      } else if (run === 4) {
        expect(data).toEqual(3);
        expect(page).toEqual(3);
      } else if (run === 5) {
        expect(data).toEqual(2);
        expect(page).toEqual(2);
      } else if (run === 6) {
        expect(data).toEqual(1);
        expect(page).toEqual(1);
      }
    };

    const pag1 = new Pagination<string>(
      "123456789",
      "12345",
      ["a", "b", "c"],
      check1
    );
    const pag2 = new Pagination<number>(
      "987654321",
      "54321",
      [1, 2, 3, 4, 5],
      check2
    );

    pag1.next();
    pag2.next();
    run++;
    pag1.next();
    pag2.next();
    run++;
    pag1.next();
    pag2.next();
    run++;
    pag1.previous();
    pag2.previous();
    run++;
    pag1.previous();
    pag2.previous();
    run++;
    pag1.previous();
    pag2.previous();
  });
});
