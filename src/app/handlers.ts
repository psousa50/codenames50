import { ErrorCodes, ServiceError } from "../utils/audit"
import { Response, ErrorRequestHandler, RequestHandler } from "express"
import { pipe } from "fp-ts/lib/pipeable"
import { bimap, run } from "fp-ts/lib/ReaderTaskEither"
import { DomainAdapter, DomainAction } from "../domain/adapters"
import { Action } from "../utils/actions"

type Query = {
  [key: string]: string | string[] | Query | Query[]
}

export function createErrorHandler(): ErrorRequestHandler {
  return (_, __, res) => {
    res.sendStatus(500)
  }
}

export function createNotFoundHandler(): RequestHandler {
  return (_, res) => {
    res.sendStatus(404)
  }
}

export const errorHandler = (res: Response) => (error: ServiceError) => {
  res.sendStatus(error.errorCode === ErrorCodes.NOT_FOUND ? 404 : 400)
}

export const okHandler = (res: Response) => (responseBody: any) => {
  res.contentType("application/json")
  res.status(200)
  res.json(responseBody)
}

export const simpleHandler = <R>(action: Action<void, void, R>): RequestHandler => async (_, res) => {
  await run(pipe(action(), bimap(errorHandler(res), okHandler(res))), undefined)
}

export const handler = <A, R>(
  env: DomainAdapter,
  action: DomainAction<A, R>,
  inputTransformer: (query: Query) => A,
): RequestHandler => async (req, res) => {
  await run(pipe(action(inputTransformer(req.body)), bimap(errorHandler(res), okHandler(res))), env)
}
