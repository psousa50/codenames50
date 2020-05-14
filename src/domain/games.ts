import * as R from "ramda"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, map, fromTaskEither } from "fp-ts/lib/ReaderTaskEither"
import {
  CodeNamesGame,
  GameStates,
  Teams,
  BoardWord,
  WordType,
  CreateGameInput,
  CreateGameOutput,
  JoinGameInput,
  JoinGameOutput,
  RevealWordInput,
  RevealWordOutput,
  ChangeTurnInput,
  ChangeTurnOutput,
} from "./models"
import { ServiceError, ErrorCodes } from "../utils/audit"
import { shuffle } from "../utils/random"
import { update2dCell } from "../utils/collections"
import { withEnv, DomainAction, actionOf, actionErrorOf, adapt } from "./adapters"

const addPlayer = (userId: string) => (game: CodeNamesGame) =>
  game.players.find(p => p.userId === userId)
    ? game
    : {
        ...game,
        players: [...game.players, { userId }],
      }

const determineWordTypes = (words: string[]): BoardWord[] => {
  const numberOfWordsForTeams = Math.max(0, Math.floor((words.length - 1) / 3))
  const numberOfWordsForInocents = Math.max(words.length - 1 - numberOfWordsForTeams * 2, 0)
  const types = [
    ...new Array(numberOfWordsForTeams).fill(WordType.red),
    ...new Array(numberOfWordsForTeams).fill(WordType.blue),
    ...new Array(numberOfWordsForInocents).fill(WordType.inocent),
    WordType.assassin,
  ]

  return shuffle(words.map((word, i) => ({ word, type: types[i], revealed: false })))
}

const buildBoard = (boardWidth: number, boardHeight: number) => (words: BoardWord[]): BoardWord[][] =>
  R.range(0, boardHeight).map(r => words.slice(r * boardWidth, r * boardWidth + boardWidth))

export const create: DomainAction<CreateGameInput, CreateGameOutput> = ({ userId, language }) =>
  withEnv(
    ({
      config: { boardWidth, boardHeight },
      adapters: { gamesRepository, wordsRepository, repositories, uuid, currentUtcDateTime },
    }) =>
      pipe(
        fromTaskEither(wordsRepository.getByLanguage(language)(repositories)),
        chain(allWords =>
          allWords
            ? actionOf(shuffle(allWords.words).slice(0, boardWidth * boardHeight))
            : actionErrorOf<string[]>(new ServiceError("Language not found", ErrorCodes.NOT_FOUND)),
        ),
        map(determineWordTypes),
        map(buildBoard(boardWidth, boardHeight)),
        chain(board =>
          fromTaskEither(
            gamesRepository.insert({
              gameId: uuid(),
              timestamp: currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"),
              userId,
              players: [{ userId }],
              state: GameStates.idle,
              turn: Teams.red,
              board,
            })(repositories),
          ),
        ),
      ),
  )

export const join: DomainAction<JoinGameInput, JoinGameOutput> = ({ gameId, userId }) =>
  withEnv(({ adapters: { gamesRepository, repositories } }) =>
    pipe(
      fromTaskEither(gamesRepository.getById(gameId)(repositories)),
      chain(game =>
        game
          ? actionOf(addPlayer(userId)(game))
          : actionErrorOf<CodeNamesGame>(new ServiceError(`Game '${gameId}' does not exist`, ErrorCodes.NOT_FOUND)),
      ),
      chain(game => adapt(gamesRepository.update(game)(repositories))),
    ),
  )

const revealWordAction = (row: number, col: number) => (game: CodeNamesGame) => ({
  ...game,
  board: update2dCell(game.board)(
    w => ({
      ...w,
      revealed: true,
    }),
    row,
    col,
  ),
})

export const revealWord: DomainAction<RevealWordInput, RevealWordOutput> = ({ gameId, row, col }) =>
  withEnv(({ adapters: { gamesRepository, repositories } }) =>
    pipe(
      fromTaskEither(gamesRepository.getById(gameId)(repositories)),
      chain(game =>
        game
          ? actionOf(revealWordAction(row, col)(game))
          : actionErrorOf<CodeNamesGame>(new ServiceError(`Game '${gameId}' does not exist`, ErrorCodes.NOT_FOUND)),
      ),
      chain(game => adapt(gamesRepository.update(game)(repositories))),
    ),
  )

const changeTurnAction = (game: CodeNamesGame) => ({
  ...game,
  turn: game.turn === Teams.red ? Teams.blue : Teams.red,
})

export const changeTurn: DomainAction<ChangeTurnInput, ChangeTurnOutput> = ({ gameId }) =>
  withEnv(({ adapters: { gamesRepository, repositories } }) =>
    pipe(
      fromTaskEither(gamesRepository.getById(gameId)(repositories)),
      chain(game =>
        game
          ? actionOf(changeTurnAction(game))
          : actionErrorOf<CodeNamesGame>(new ServiceError(`Game '${gameId}' does not exist`, ErrorCodes.NOT_FOUND)),
      ),
      chain(game => adapt(gamesRepository.update(game)(repositories))),
    ),
  )

export const gamesDomain = {
  create,
  join,
  revealWord,
  changeTurn,
}

export type GamesDomain = typeof gamesDomain
