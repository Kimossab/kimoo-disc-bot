import { createReaction } from '../discord/rest';
import { isReady } from '../state/actions';

declare type pagination_callback<T> = (
  data: T,
  page: number,
  total: number,
  token: string
) => void;

class Pagination<T> {
  private _channel: string;
  private _message: string;
  private _data: T[];
  private _callback: pagination_callback<T>;
  private _page = 1;
  private _token: string;

  constructor(
    channel: string,
    message: string,
    data: T[],
    callback: pagination_callback<T>,
    token: string
  ) {
    this._channel = channel;
    this._message = message;
    this._data = data;
    this._callback = callback;
    this._token = token;

    if (isReady()) {
      const channel = this._channel;
      const message = this._message;
      (async () => {
        await createReaction(channel, message, '◀');
        await createReaction(channel, message, '▶');
      })();
    }
  }

  private emitCallback() {
    this._callback(
      this._data[this._page - 1],
      this._page,
      this._data.length,
      this._token
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
