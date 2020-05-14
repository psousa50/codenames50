import { ErrorCodes, ServiceError } from "../utils/audit"
import { Response, ErrorRequestHandler, RequestHandler } from "express"
import { pipe } from "fp-ts/lib/pipeable"
import { bimap } from "fp-ts/lib/TaskEither"
import { Adapter } from "../utils/adapters"

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

export const responseHandler = <A, R>(action: Adapter<A, R>): RequestHandler => async (req, res) => {
  await pipe(action(req.body), bimap(errorHandler(res), okHandler(res)))()
}
