import { ErrorCodes, ServiceError } from "../utils/audit"
import { Response, ErrorRequestHandler, RequestHandler } from "express"
import { Environment } from "../environment"
import { Action } from "../utils/actions"
import { pipe } from "fp-ts/lib/pipeable"
import { bimap, run } from "fp-ts/lib/ReaderTaskEither"

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

export const noRequestHandler = <R>(env: Environment, action: Action<void, R>): RequestHandler => async (_, res) => {
  await run(pipe(action(), bimap(errorHandler(res), okHandler(res))), env)
}

export const handler = <A, R>(
  env: Environment,
  action: Action<A, R>,
  inputTransformer: (query: Query) => A,
): RequestHandler => async (req, res) => {
  await run(pipe(action(inputTransformer(req.body)), bimap(errorHandler(res), okHandler(res))), env)
}
