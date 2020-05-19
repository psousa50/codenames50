import { Either, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, fromEither, fromTaskEither, map, ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither"
import { ServiceError } from "./errors"

export type Port<E, VI, R> = (i: VI) => ReaderTaskEither<E, ServiceError, R>

export type Validator<ServiceError, I> = (i: I) => Either<ServiceError, I>
export type Transformer<VI = void, I = VI> = (i: I) => VI

export const buildAdapter = <E = void, VI = void, I = VI, R = void>(
  port: Port<E, VI, R>,
  transformer: Transformer<VI, I> = i => (i as any) as VI,
  validator: Validator<ServiceError, I> = i => right<ServiceError, I>(i),
): Port<E, I, R> => (i: I) => pipe(fromEither(validator(i)), map(transformer), chain(port))

export const adapt = <E2, E1, R>(a: ReaderTaskEither<E2, ServiceError, R>, e: E2) =>
  fromTaskEither<E1, ServiceError, R>(a(e))
