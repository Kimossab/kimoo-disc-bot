import { createReaction } from "../discord/rest";
import { isReady } from "../state/actions";
import { GuildMember } from "../types/discord";

declare type pagination_callback<T> = (
  data: T,
  page: number,
  total: number,
  token: string,
  userInfo?: Nullable<GuildMember>
) => void;

class Pagination<T> {
  private _channel: string;

  private _message: string;

  private _data: T[];

  private _callback: pagination_callback<T>;

  private _page = 1;

  private _token: string;

  private _user: Nullable<GuildMember>;

  constructor(
    channel: string,
    message: string,
    data: T[],
    callback: pagination_callback<T>,
    token: string,
    userInfo?: GuildMember
  ) {
    this._channel = channel;
    this._message = message;
    this._data = data;
    this._callback = callback;
    this._token = token;
    this._user = userInfo;

    if (isReady()) {
      const channel = this._channel;
      const message = this._message;
      (async () => {
        await createReaction(channel, message, "◀");
        setTimeout(() => {
          createReaction(channel, message, "▶");
        }, 250);
      })();
    }
  }

  private emitCallback() {
    this._callback(
      this._data[this._page - 1],
      this._page,
      this._data.length,
      this._token,
      this._user
    );
  }

  public get message(): string {
    return this._message;
  }

  public next(): void {
    this._page++;

    if (this._page > this._data.length) {
      this._page = 1;
    }

    this.emitCallback();
  }

  public previous(): void {
    this._page--;

    if (this._page < 1) {
      this._page = this._data.length;
    }

    this.emitCallback();
  }
}

export default Pagination;
