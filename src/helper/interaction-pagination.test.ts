import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "../discord/rest";
import {
  ButtonStyle,
  ComponentType,
  InteractionCallbackType,
  InteractionData,
} from "../types/discord";
import { InteractionPagination } from "./interaction-pagination";

jest.mock("../discord/rest");

const APP_ID = "APP_ID";
const TOKEN = "TOKEN";
const DATA = [
  "test data 1",
  "test data 2",
  "test data 3",
  "test data 4",
  "test data 5",
];

describe("InteractionPagination", () => {
  let pagination: InteractionPagination<string>;

  const mockCreatePage = jest.fn();

  beforeEach(() => {
    pagination = new InteractionPagination(APP_ID, DATA, mockCreatePage);
    mockCreatePage.mockReturnValue({
      embeds: DATA.map((data) => ({ title: data })),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call `editOriginalInteractionResponse` on create", () => {
    pagination.create(TOKEN);
    expect(mockCreatePage).toHaveBeenCalledWith(1, 5, DATA[0]);
    expect(editOriginalInteractionResponse).toHaveBeenCalledWith(
      APP_ID,
      TOKEN,
      {
        embeds: DATA.map((data) => ({ title: data })),
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.SelectMenu,
                custom_id: "pagination.select",
                options: Array.from(Array(5)).map((value, index) => {
                  return {
                    label: `Page ${index + 1}`,
                    value: index.toString(),
                    default: index === 0,
                  };
                }),
              },
            ],
          },
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                custom_id: "pagination.previous",
                label: "◀",
              },
              {
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                custom_id: "pagination.next",
                label: "▶",
              },
            ],
          },
        ],
      }
    );
  });

  it.each`
    custom_id                | values       | expectedPage | expectedBehavior | expectedValue
    ${"pagination.next"}     | ${undefined} | ${1}         | ${"call"}        | ${"createInteractionResponse"}
    ${"pagination.previous"} | ${undefined} | ${4}         | ${"call"}        | ${"createInteractionResponse"}
    ${"pagination.select"}   | ${[2]}       | ${2}         | ${"call"}        | ${"createInteractionResponse"}
    ${"pagination.asdsa"}    | ${undefined} | ${1}         | ${"throw"}       | ${"Unknown interaction"}
  `(
    "should $expectedBehavior `$expectedValue` on handlePage",
    async ({
      custom_id,
      values,
      expectedPage,
      expectedBehavior,
      expectedValue,
    }) => {
      if (expectedBehavior === "call") {
        await expect(
          pagination.handlePage("INTERACTION_ID", TOKEN, {
            custom_id,
            values,
          } as InteractionData)
        ).resolves.toBe(undefined);
        expect(mockCreatePage).toHaveBeenCalledWith(
          expectedPage + 1,
          5,
          DATA[expectedPage]
        );
        expect(createInteractionResponse).toHaveBeenCalledWith(
          "INTERACTION_ID",
          TOKEN,
          {
            type: InteractionCallbackType.UPDATE_MESSAGE,
            data: expect.any(Object),
          }
        );
      } else if (expectedBehavior === "throw") {
        await expect(
          pagination.handlePage("INTERACTION_ID", TOKEN, {
            custom_id,
            values,
          } as InteractionData)
        ).rejects.toThrow(expectedValue);
        expect(createInteractionResponse).not.toHaveBeenCalled();
      }
    }
  );
});
