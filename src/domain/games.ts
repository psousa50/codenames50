import { Action, withEnv, transform, actionOf } from "../utils/actions"
import { UUID } from "../utils/types"
import { pipe } from "fp-ts/lib/pipeable"
import { chain } from "fp-ts/lib/ReaderTaskEither"
import { CodeNameGame } from "../repositories/games"
import { lj } from "../utils/debug"

export interface CreateRequest {
  userId: string
}

export interface CreateResponse {
  gameId: UUID
}

export interface JoinRequest {
  gameId: string
  userId: string
}

const addPlayer = (userId: string) => (game: CodeNameGame) => ({
  ...game,
  players: [...game.players, { userId }],
})

export const create: Action<CreateRequest, CreateResponse> = req => {
  const userId = req.userId
  const newGame = {
    userId,
    players: [{ userId }],
  }

  return withEnv(env => transform(env.gamesRepository.insert(newGame), gameId => ({ gameId })))
}

export const join: Action<JoinRequest, void> = req => {
  const gameId = req.gameId
  const userId = req.userId

  return withEnv(env =>
    pipe(
      env.gamesRepository.getById(gameId),
      chain(game => actionOf(addPlayer(userId)(game!))),
      chain(env.gamesRepository.update),
    ),
  )
}
