import { Action, withEnv, transform } from "../utils/actions"
import { UUID } from "../utils/types"

export interface CreateRequest {
  userId: string
}

export interface CreateResponse {
  gameId: UUID
}

export const create: Action<CreateRequest, CreateResponse> = req => {
  const newGame = {
    userId: req.userId,
  }

  return withEnv(env => transform(env.gamesRepository.insert(newGame), gameId => ({ gameId })))
}
