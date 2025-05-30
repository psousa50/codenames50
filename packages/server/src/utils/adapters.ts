import { Either, right } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, fromEither, fromTaskEither, map, ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither"
import { ServiceError } from "./errors"
import { DomainEnvironment } from "../domain/adapters"
import { RepositoriesEnvironment } from "../repositories/adapters"
import { GameMessagingEnvironment } from "../messaging/adapters"
import { MongoEnvironment } from "../mongodb/adapters"
import { SocketsEnvironment } from "../sockets/adapters"

export type Port<E, VI, R> = (i: VI) => ReaderTaskEither<E, ServiceError, R>

export type Validator<ServiceError, I> = (i: I) => Either<ServiceError, I>
export type Transformer<VI = void, I = VI> = (i: I) => VI

export const buildAdapter =
  <E = void, VI = void, I = VI, VR = void, R = VR>(
    port: Port<E, VI, VR>,
    inTransformer: Transformer<VI, I> = i => i as unknown as VI,
    inValidator: Validator<ServiceError, I> = i => right<ServiceError, I>(i),
    outTransformer: Transformer<R, VR> = r => r as unknown as R,
    outValidator: Validator<ServiceError, VR> = r => right<ServiceError, VR>(r),
  ): Port<E, I, R> =>
  (i: I) =>
    pipe(
      fromEither(inValidator(i)),
      map(inTransformer),
      chain(port),
      chain(o => fromEither(outValidator(o))),
      map(a => outTransformer(a)),
    )

// Basic adapt function for simple cases where environment types match exactly
export const adapt = <E, R>(a: ReaderTaskEither<E, ServiceError, R>, e: E): ReaderTaskEither<E, ServiceError, R> =>
  fromTaskEither(a(e))

// Environment adapter functions

// Adapt a repository function to work with domain environment
export function adaptRepositoryToDomain<R>(
  repoReader: ReaderTaskEither<RepositoriesEnvironment, ServiceError, R>,
  domainEnv: DomainEnvironment,
): ReaderTaskEither<DomainEnvironment, ServiceError, R> {
  // Extract the repositories environment from the domain environment
  const repoEnv = domainEnv.repositoriesAdapter.repositoriesEnvironment
  // Execute the repository function with the correct environment
  const taskEither = repoReader(repoEnv)
  // Return a new ReaderTaskEither that works with domain environment
  return fromTaskEither(taskEither)
}

// Adapt a messaging function to work with domain environment
export function adaptMessagingToDomain<R>(
  messagingReader: ReaderTaskEither<GameMessagingEnvironment, ServiceError, R>,
  domainEnv: DomainEnvironment,
): ReaderTaskEither<DomainEnvironment, ServiceError, R> {
  // Extract the messaging environment from the domain environment
  const messagingEnv = domainEnv.gameMessagingAdapter.gameMessagingEnvironment
  // Execute the messaging function with the correct environment
  const taskEither = messagingReader(messagingEnv)
  // Return a new ReaderTaskEither that works with domain environment
  return fromTaskEither(taskEither)
}

// Adapt a MongoDB function to work with repositories environment
export function adaptMongoToRepository<R>(
  mongoReader: ReaderTaskEither<MongoEnvironment, ServiceError, R>,
  repoEnv: RepositoriesEnvironment,
): ReaderTaskEither<RepositoriesEnvironment, ServiceError, R> {
  // Extract the mongo environment from the repositories environment
  const mongoEnv = repoEnv.mongoAdapter.mongoEnvironment
  // Execute the mongo function with the correct environment
  const taskEither = mongoReader(mongoEnv)
  // Return a new ReaderTaskEither that works with repositories environment
  return fromTaskEither(taskEither)
}

// Adapt a domain function to work with sockets environment
export function adaptDomainToSocket<R>(
  domainReader: ReaderTaskEither<DomainEnvironment, ServiceError, R>,
  socketEnv: SocketsEnvironment,
): ReaderTaskEither<SocketsEnvironment, ServiceError, R> {
  // Extract the domain environment from the sockets environment
  const domainEnv = socketEnv.domainEnvironment
  // Execute the domain function with the correct environment
  const taskEither = domainReader(domainEnv)
  // Return a new ReaderTaskEither that works with sockets environment
  return fromTaskEither(taskEither)
}

// Adapt a messaging function to work with sockets environment
export function adaptMessagingToSocket<R>(
  messagingReader: ReaderTaskEither<GameMessagingEnvironment, ServiceError, R>,
  socketEnv: SocketsEnvironment,
): ReaderTaskEither<SocketsEnvironment, ServiceError, R> {
  // Extract the messaging environment from the sockets environment
  const messagingEnv = socketEnv.gameMessagingEnvironment
  // Execute the messaging function with the correct environment
  const taskEither = messagingReader(messagingEnv)
  // Return a new ReaderTaskEither that works with sockets environment
  return fromTaskEither(taskEither)
}
