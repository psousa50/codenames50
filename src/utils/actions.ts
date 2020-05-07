import { fold, left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { ask as askReader } from "fp-ts/lib/Reader"

import {
  chain,
  fromEither,
  fromTaskEither,
  map,
  ReaderTaskEither,
  rightReader,
} from "fp-ts/lib/ReaderTaskEither"
import { tryCatch } from "fp-ts/lib/TaskEither"
import { Environment } from "../environment"
import { ServiceError } from "./audit"
import { logDebug } from "./debug"

export type ActionResult<R = void> = ReaderTaskEither<Environment, ServiceError, R>
export type Action<I = void, R = void> = (i: I) => ActionResult<R>

export const ask = () => rightReader<Environment, ServiceError, Environment>(askReader<Environment>())

export const delay = <E, A, R>(env: E) => (
  millis: number,
): ((rte: ReaderTaskEither<E, A, R>) => ReaderTaskEither<E, A, R>) => rte => {
  const promiseDelay = new Promise<R>((resolve, reject) => {
    setTimeout(() => {
      rte(env)().then(fold(reject, resolve))
    }, millis)
  })

  return fromTaskEither(tryCatch(() => promiseDelay, e => e as A))
}

export const actionOf = <R>(v: R): ActionResult<R> => fromEither(right(v))
export function actionErrorOf<R>(error: ServiceError): ActionResult<R> {
  return fromEither(left<ServiceError, R>(error))
}

export const toAction = <I, R>(f: (i: I) => R): ((i: I) => ActionResult<R>) => i => {
  try {
    return actionOf(f(i))
  } catch (error) {
    return fromEither(left(error))
  }
}

export const fromPromise = <T>(lazyPromise: (env: Environment) => Promise<T>) =>
  pipe(
    ask(),
    chain(env =>
      fromTaskEither(
        tryCatch(
          () => lazyPromise(env),
          e => {
            logDebug(`ERROR: ${(e as Error).message}`)
            return new ServiceError((e as Error).message)
          },
        ),
      ),
    ),
  )

export const fromVoidPromise = <T>(lazyPromise: (env: Environment) => Promise<T>) =>
  pipe(
    fromPromise(lazyPromise),
    chain(() => actionOf(undefined)),
  )

export function rteActionsSequence<R>(rte: Array<ReaderTaskEither<Environment, ServiceError, R>>) {
  return rte.reduceRight(
    (acc, cur) =>
      pipe(
        cur,
        chain(value =>
          pipe(
            acc,
            map(values => [...values, value]),
          ),
        ),
      ),
    actionOf([] as R[]),
  )
}
