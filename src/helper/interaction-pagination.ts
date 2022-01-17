import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from "../discord/rest";
import {
  ActionRow,
  Button,
  ButtonStyle,
  Component,
  ComponentType,
  EditWebhookMessage,
  InteractionCallbackData,
  InteractionCallbackType,
  InteractionData,
  Message,
  snowflake,
} from "../types/discord";

export type CreatePageCallback<T> = (
  page: number,
  total: number,
  data: T,
  extraInfo?: unknown
) => Promise<{
  data: EditWebhookMessage | InteractionCallbackData;
  file?: string;
}>;

export class InteractionPagination<T> {
  private readonly appId: string;
  private readonly data: T[];
  private readonly createPage: CreatePageCallback<T>;
  private readonly extraInfo: unknown;

  private currentPage = 0;
  private get totalPages() {
    return this.data.length;
  }
  private message: Nullable<Message> = null;

  public get messageId(): snowflake | undefined {
    return this.message?.id;
  }

  constructor(
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

  private async buildPageData() {
    const { data: pageData, file } = await this.createPage(
      this.currentPage + 1,
      this.totalPages,
      this.data[this.currentPage],
      this.extraInfo
    );

    if (this.totalPages > 1) {
      const buttonLeft: Button = {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "pagination.previous",
        label: "◀",
      };
      const pageSelector: Component = {
        type: ComponentType.SelectMenu,
        custom_id: "pagination.select",
        options: Array.from(Array(this.data.length)).map(
          (_value, index) => {
            return {
              label: `Page ${index + 1}`,
              value: index.toString(),
              default: index === this.currentPage,
            };
          }
        ),
      };
      const buttonRight: Button = {
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        custom_id: "pagination.next",
        label: "▶",
      };
      const actionRow: ActionRow = {
        type: ComponentType.ActionRow,
        components: [buttonLeft, buttonRight],
      };
      pageData.components = [
        ...(pageData.components ?? []),
        {
          type: ComponentType.ActionRow,
          components: [pageSelector],
        },
        actionRow,
      ];
    }

    return { pageData, file };
  }

  public async create(
    token: string
  ): Promise<Message | null> {
    const { pageData, file } = await this.buildPageData();
    this.message = await editOriginalInteractionResponse(
      this.appId,
      token,
      pageData,
      file
    );

    return this.message;
  }

  public async handlePage(
    id: string,
    token: string,
    data: InteractionData
  ): Promise<void> {
    const move = data.custom_id?.split(".")[1];
    if (move === "next") {
      this.currentPage++;
    } else if (move === "previous") {
      this.currentPage--;
    } else if (move === "select") {
      this.currentPage = Number(data.values![0]);
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
        type: InteractionCallbackType.UPDATE_MESSAGE,
        data: pageData as InteractionCallbackData,
      },
      file
    );
  }
}
