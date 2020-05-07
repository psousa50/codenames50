import { Response, Router } from "express"
import { pipe } from "fp-ts/lib/pipeable"
import { bimap, run } from "fp-ts/lib/ReaderTaskEither"
import { Environment } from "../../../environment"
import { ErrorCodes, ServiceError } from "../../../utils/audit"
import { actionOf } from "../../../utils/actions"

const errorHandler = (res: Response) => (error: ServiceError) => {
  res.sendStatus(error.dependencyError ? (error.errorCode === ErrorCodes.NOT_FOUND ? 404 : 502) : 400)
}

const okHandler = (res: Response) => (responseBody: any) => {
  res.contentType("application/json")
  res.status(200)
  res.json(responseBody)
}

export const router = (env: Environment) =>
  Router().get("/health", async (_, res) => {
    await run(pipe(actionOf({ result: "Ok"}), bimap(errorHandler(res), okHandler(res))), env)
  })
