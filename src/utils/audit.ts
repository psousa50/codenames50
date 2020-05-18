export class ServiceError {
  constructor(public readonly message: string | undefined, public readonly errorCode?: string | undefined) {}
}

export const throwError = (e: ServiceError): void => {
  throw new Error(e.message)
}

export enum LogLevel {
  debug = "debug",
  info = "info",
  warn = "warn",
  error = "error",
}
