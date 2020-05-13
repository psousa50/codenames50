import { fold, left, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { ask as askReader } from "fp-ts/lib/Reader"

import { chain, fromEither, fromTaskEither, map, ReaderTaskEither, rightReader } from "fp-ts/lib/ReaderTaskEither"
import { tryCatch } from "fp-ts/lib/TaskEither"
import { ServiceError } from "./audit"
import { logDebug } from "./debug"

export type ActionResult<E, R = void> = ReaderTaskEither<E, ServiceError, R>
export type Action<E = void, I = void, R = void> = (i: I) => ActionResult<E, R>

export function ask<E>() {
  return rightReader<E, ServiceError, E>(askReader<E>())
}

export const withEnv = <E, R>(f: (env: E) => ActionResult<E, R>) => pipe(ask<E>(), chain(f))
export const transform = <E, R = void, T = void>(action: ActionResult<E, R>, t: (r: R) => T) => pipe(action, map(t))

export const delay = <E, A, R>(env: E) => (
  millis: number,
): ((rte: ReaderTaskEither<E, A, R>) => ReaderTaskEither<E, A, R>) => rte => {
  const promiseDelay = new Promise<R>((resolve, reject) => {
    setTimeout(() => {
      rte(env)().then(fold(reject, resolve))
    }, millis)
  })

  return fromTaskEither(
    tryCatch(
      () => promiseDelay,
      e => e as A,
    ),
  )
}

export const actionOf = <E, R>(v: R): ActionResult<E, R> => fromEither(right(v))
export function actionErrorOf<E, R>(error: ServiceError): ActionResult<E, R> {
  return fromEither(left<ServiceError, R>(error))
}

export const toAction = <E, I, R>(f: (i: I) => R): ((i: I) => ActionResult<E, R>) => i => {
  try {
    return actionOf(f(i))
  } catch (error) {
    return fromEither(left(error))
  }
}

export const fromPromise = <E, T>(lazyPromise: (env: E) => Promise<T>) =>
  pipe(
    ask<E>(),
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

export const fromVoidPromise = <E, T>(lazyPromise: (env: E) => Promise<T>) =>
  pipe(
    fromPromise(lazyPromise),
    chain(() => actionOf(undefined)),
  )

export function rteActionsSequence<E, R>(rte: Array<ReaderTaskEither<E, ServiceError, R>>) {
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
