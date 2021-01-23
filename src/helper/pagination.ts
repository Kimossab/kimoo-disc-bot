import { createReaction } from "../discord/rest";
import { isReady } from "../state/actions";

declare type pagination_callback<T> = (
  channel: string,
  message: string,
  data: T,
  page: number,
  total: number
) => void;

class Pagination<T> {
  private _channel: string;
  private _message: string;
  private _data: T[];
  private _callback: pagination_callback<T>;
  private _page = 1;

  constructor(
    channel: string,
    message: string,
    data: T[],
    callback: pagination_callback<T>
  ) {
    this._channel = channel;
    this._message = message;
    this._data = data;
    this._callback = callback;

    if (isReady()) {
      createReaction(this._channel, this._message, "⬅");

      setTimeout(() => {
        createReaction(this._channel, this._message, "➡");
      }, 500);
    }
  }

  private emitCallback() {
    this._callback(
      this._channel,
      this._message,
      this._data[this._page - 1],
      this._page,
      this._data.length
    );
  }

  public get message() {
    return this._message;
  }

  public next() {
    this._page++;

    if (this._page > this._data.length) {
      this._page = 1;
    }

    this.emitCallback();
  }

  public previous() {
    this._page--;

    if (this._page < 1) {
      this._page = this._data.length;
    }

    this.emitCallback();
  }
}

export default Pagination;
