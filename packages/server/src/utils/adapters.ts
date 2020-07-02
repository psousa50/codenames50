import { Either, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, fromEither, fromTaskEither, map, ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither"
import { ServiceError } from "./errors"

export type Port<E, VI, R> = (i: VI) => ReaderTaskEither<E, ServiceError, R>

export type Validator<ServiceError, I> = (i: I) => Either<ServiceError, I>
export type Transformer<VI = void, I = VI> = (i: I) => VI

export const buildAdapter = <E = void, VI = void, I = VI, VR = void, R = VR>(
  port: Port<E, VI, VR>,
  inTransformer: Transformer<VI, I> = i => (i as unknown) as VI,
  inValidator: Validator<ServiceError, I> = i => right<ServiceError, I>(i),
  outTransformer: Transformer<R, VR> = r => (r as unknown) as R,
  outValidator: Validator<ServiceError, VR> = r => right<ServiceError, VR>(r),
): Port<E, I, R> => (i: I) =>
  pipe(
    fromEither(inValidator(i)),
    map(inTransformer),
    chain(port),
    chain(o => fromEither(outValidator(o))),
    map(a => outTransformer(a)),
  )

export const adapt = <E2, E1, R>(a: ReaderTaskEither<E2, ServiceError, R>, e: E2) =>
  fromTaskEither<E1, ServiceError, R>(a(e))
