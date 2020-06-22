import { left, right } from "fp-ts/lib/Either"
import { chain, fromEither, TaskEither } from "fp-ts/lib/TaskEither"
import { logDebug } from "./debug"

export type ActionResult<R = void> = TaskEither<Error, R>
export type Action<I = void, R = void> = (i: I) => ActionResult<R>

export const actionOf = <T>(v: T): ActionResult<T> => fromEither(right(v))

export const toAction = <I, R>(f: (i: I) => R): ((i: I) => ActionResult<R>) => i => {
  try {
    return actionOf(f(i))
  } catch (error) {
    return fromEither(left(error))
  }
}

export const chainLogTE = <I, R>(m: string, action: Action<I, R>) =>
  chain((v: I) => {
    logDebug(`${m}=>`, v)
    return action(v)
  })
