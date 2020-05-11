import { pipe } from "fp-ts/lib/pipeable"
import { chain, swap, tryCatch } from "fp-ts/lib/TaskEither"
import { actionOf, ActionResult } from "./actions"
import * as Errors from "./errors"

function defaultErrorHandler(response: Response, message?: string): Error {
  switch (response.status) {
    case 400:
      return new Errors.BadRequestError(message)
    case 401:
      return new Errors.UnAuthorised(message)
    case 403:
      return new Errors.ForbiddenError(message)
    case 404:
      return new Errors.NotFoundError(message)
    case 500:
      return new Errors.NotOkError(message)
    case 502:
      return new Errors.BadGatewayError(message)
    case 503:
      return new Errors.ServiceUnavailableError(message)
    default:
      return new Errors.HttpError(response.status, message)
  }
}

async function errorMessage(response: Response): Promise<Error> {
  return response
    .text()
    .then(body => body || response.statusText)
    .catch(() => response.statusText)
    .then(msg => defaultErrorHandler(response, msg))
}

function responseMapper(response: Response): ActionResult<Response> {
  if (response.ok) {
    return actionOf(response)
  } else {
    return pipe(
      tryCatch(
        () => errorMessage(response),
        () => response,
      ),
      swap,
    )
  }
}

export const fetchAction = (input: Request | string, init?: RequestInit): ActionResult<Response> => {
  function coreFetch(): ActionResult<Response> {
    console.log("init=====>\n", init)
    return tryCatch(
      () => fetch(input, init),
      error => error as Error,
    )
  }

  return pipe(coreFetch(), chain(responseMapper))
}

export const extractText = (response: Response): ActionResult<string> =>
  tryCatch(
    () => response.text(),
    e => new Errors.BadResponseError((e as Error).message),
  )

export const extractJson = (response: Response): ActionResult<any> =>
  tryCatch(
    () => response.json(),
    e => new Errors.BadResponseError((e as Error).message),
  )

export function fetchJson<T>(input: Request | string, init?: RequestInit): ActionResult<T> {
  return pipe(fetchAction(input, init), chain(extractJson))
}

export function postJson<T>(input: Request | string, init?: RequestInit): ActionResult<T> {
  return pipe(
    fetchAction(input, {
      ...init,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }),
    chain(extractJson),
  )
}
