import { ErrorRequestHandler, RequestHandler, Response } from "express"
import { pipe } from "fp-ts/lib/pipeable"
import { bimap } from "fp-ts/lib/TaskEither"
import { Port } from "../utils/adapters"
import { ErrorCodes, ServiceError } from "../utils/audit"

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

export const responseHandler = <E, A, R>(environment: E, action: Port<E, A, R>): RequestHandler => async (req, res) => {
  await pipe(action(req.body)(environment), bimap(errorHandler(res), okHandler(res)))()
}
