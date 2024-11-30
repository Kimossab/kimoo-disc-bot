import {
  createInteractionResponse,
  editOriginalInteractionResponse
} from "@/discord/rest";
import { chunkArray } from "./common";
import { ComponentType, ButtonStyle, InteractionResponseType, APIMessageButtonInteractionData, APIMessageSelectMenuInteractionData, RESTPatchAPIChannelMessageFormDataBody, APIMessage, APIButtonComponent, APIActionRowComponent, APISelectMenuComponent, RESTPatchAPIInteractionOriginalResponseJSONBody, APIInteractionResponseCallbackData } from "discord-api-types/v10";

export type CreatePageCallback<T> = (
  page: number,
  total: number,
  data: T,
  extraInfo?: unknown
) => Promise<{
  data: APIInteractionResponseCallbackData;
  file?: string;
}>;

export class InteractionPagination<T = unknown> {
  private readonly appId: string;

  private readonly data: T[];

  private readonly createPage: CreatePageCallback<T>;

  private readonly extraInfo: unknown;

  private currentPage = 0;

  private get totalPages () {
    return this.data.length;
  }

  private message: Nullable<APIMessage> = null;

  public get messageId (): string | undefined {
    return this.message?.id;
  }

  constructor (
    appId: string,
    data: T[],
    createPage: CreatePageCallback<T>,
    extraInfo?: unknown
  ) {
    this.appId = appId;
    this.data = data;
    this.createPage = createPage;
    this.extraInfo = extraInfo;
  }

  private async buildPageData () {
    const { data: pageData, file } = await this.createPage(
      this.currentPage + 1,
      this.totalPages,
      this.data[this.currentPage],
      this.extraInfo
    );

    if (this.totalPages > 1) {
      const buttonLeft: APIButtonComponent = {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "pagination.previous",
        label: "◀"
      };
      const chunks = chunkArray(this.data, 25);
      const pageSelector: APIActionRowComponent<APISelectMenuComponent>[] = chunks.map((chunk, pIdx) => ({
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.StringSelect,
            custom_id: `pagination.select.${pIdx}`,
            options: Array.from(Array(chunk.length)).map((_value, index) => {
              return {
                label: `Page ${index + 1 + pIdx * 25}`,
                value: (index + pIdx * 25).toString(),
                default: index + pIdx * 25 === this.currentPage
              };
            })
          }
        ]
      }));
      const buttonRight: APIButtonComponent = {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "pagination.next",
        label: "▶"
      };
      const actionRow: APIActionRowComponent<APIButtonComponent> = {
        type: ComponentType.ActionRow,
        components: [buttonLeft, buttonRight]
      };
      pageData.components = [
        ...pageData.components ?? [],
        ...pageSelector,
        actionRow
      ];
    }

    return {
      pageData,
      file
    };
  }

  public async create (token: string): Promise<APIMessage | null> {
    const { pageData, file } = await this.buildPageData();
    this.message = await editOriginalInteractionResponse(
      this.appId,
      token,
      pageData,
      file
    );

    return this.message;
  }

  public async handlePage (
    id: string,
    token: string,
    data: APIMessageButtonInteractionData | APIMessageSelectMenuInteractionData
  ): Promise<void> {
    const move = data.custom_id?.split(".")[1];
    if (move === "next") {
      this.currentPage++;
    } else if (move === "previous") {
      this.currentPage--;
    } else if (move === "select") {
      const selectData = data as APIMessageSelectMenuInteractionData;
      if (!selectData.values) {
        throw new Error("Missing values");
      }
      this.currentPage = Number(selectData.values[0]);
    } else {
      throw new Error("Unknown interaction");
    }

    if (this.currentPage < 0) {
      this.currentPage = this.data.length - 1;
    } else if (this.currentPage >= this.data.length) {
      this.currentPage = 0;
    }

    const { pageData, file } = await this.buildPageData();
    await createInteractionResponse(
      id,
      token,
      {
        type: InteractionResponseType.UpdateMessage,
        data: pageData
      },
      file
    );
  }
}
