import { Either, right, left } from "fp-ts/lib/Either"
import { ServiceError } from "./audit"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, map, fromEither, TaskEither } from "fp-ts/lib/TaskEither"
import { ReaderTaskEither, fromTaskEither } from "fp-ts/lib/ReaderTaskEither"

export type Adapter<I = void, R = void> = (i: I) => TaskEither<ServiceError, R>
export type Port<E, VI, R> = (i: VI) => ReaderTaskEither<E, ServiceError, R>

export type ToAdapter<E, I, R, P extends Port<E, I, R>> = {
  [K in keyof P]: Adapter<I, R>
}

export type Validator<ServiceError, I> = (i: I) => Either<ServiceError, I>
export type Transformer<VI = void, I = VI> = (i: I) => VI

export const adapterOf = <R>(v: R): TaskEither<ServiceError, R> => fromEither(right(v))
export const adapterErrorOf = <R>(e: ServiceError): TaskEither<ServiceError, R> => fromEither(left(e))

export const portToAdapter = <E, VI, R>(port: Port<E, VI, R>) => (i: VI) => port(i)({} as any)

export const adapt = <E, R>(a: TaskEither<ServiceError, R>) => fromTaskEither<E, ServiceError, R>(a)

export const buildAdapter = <E = void, VI = void, I = VI, R = void>(
  environment: E,
  port: Port<E, VI, R>,
  transformer: Transformer<VI, I> = i => (i as any) as VI,
  validator: Validator<ServiceError, I> = i => right<ServiceError, I>(i),
): Adapter<I, R> => (i: I) => {
  return pipe(
    fromEither(validator(i)),
    map(transformer),
    chain(vi => port(vi)(environment)),
  )
}
