/* eslint-disable no-console */
import { createLogger, format, transports } from "winston";
import LokiTransport from "winston-loki";

export interface ILogger {
  info(message: string, ...data: unknown[]): void;
  debug(message: string, ...data: unknown[]): void;
  error(message: string, ...data: unknown[]): void;
}

class Logger implements ILogger {
  private _winston;

  constructor (module: string) {
    this._winston = createLogger({
      level: process.env.ENV == "prod"
        ? "info"
        : "silly",
      defaultMeta: { module },
      transports: [
        new LokiTransport({
          host: process.env.LOKI_HOST,
          labels: { app: process.env.LOKI_APP,
            module,
            env: process.env.ENV },
          basicAuth: process.env.LOKI_BASIC_AUTH,
          json: true,
          format: format.json(),
          replaceTimestamp: true,
          onConnectionError: (err) => console.error(err)
        }),
        new transports.Console({
          format: format.combine(
            format.timestamp(),
            format.simple(),
            format.colorize()
          )
        })
      ]
    });
  }

  public info (message: string, ...data: unknown[]) {
    this._winston.info(message, ...data);
  }

  public warn (message: string, ...data: unknown[]) {
    this._winston.warn(message, ...data);
  }

  public debug (message: string, ...data: unknown[]) {
    this._winston.debug(message, ...data);
  }

  public error (message: string, ...data: unknown[]) {
    this._winston.error(message, ...data);
  }
}

export default Logger;
