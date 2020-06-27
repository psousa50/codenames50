export class ServiceError {
  constructor(public readonly message: string | undefined, public readonly errorCode?: string | undefined) {}
}
