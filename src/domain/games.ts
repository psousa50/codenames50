import * as R from "ramda"
import { pipe } from "fp-ts/lib/pipeable"
import { chain, map } from "fp-ts/lib/ReaderTaskEither"
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
import { DomainPort, DomainEnvironment } from "./adapters"
import { withEnv, actionOf, actionErrorOf } from "../utils/actions"
import { adapt } from "../utils/adapters"

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

export const create: DomainPort<CreateGameInput, CreateGameOutput> = ({ userId, language }) =>
  withEnv(
    ({
      config: { boardWidth, boardHeight },
      adapters: { gamesRepository, wordsRepository, uuid, currentUtcDateTime },
    }) =>
      pipe(
        adapt(wordsRepository.getByLanguage(language)),
        chain(allWords =>
          allWords
            ? actionOf(shuffle(allWords.words).slice(0, boardWidth * boardHeight))
            : actionErrorOf<DomainEnvironment, string[]>(new ServiceError("Language not found", ErrorCodes.NOT_FOUND)),
        ),
        map(determineWordTypes),
        map(buildBoard(boardWidth, boardHeight)),
        chain(board =>
          adapt(
            gamesRepository.insert({
              gameId: uuid(),
              timestamp: currentUtcDateTime().format("YYYY-MM-DD HH:mm:ss"),
              userId,
              players: [{ userId }],
              state: GameStates.idle,
              turn: Teams.red,
              board,
            }),
          ),
        ),
      ),
  )

export const join: DomainPort<JoinGameInput, JoinGameOutput> = ({ gameId, userId }) =>
  withEnv(({ adapters: { gamesRepository } }) =>
    pipe(
      adapt(gamesRepository.getById(gameId)),
      chain(game =>
        game
          ? actionOf(addPlayer(userId)(game))
          : actionErrorOf<DomainEnvironment, CodeNamesGame>(
              new ServiceError(`Game '${gameId}' does not exist`, ErrorCodes.NOT_FOUND),
            ),
      ),
      chain(game => adapt(gamesRepository.update(game))),
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

export const revealWord: DomainPort<RevealWordInput, RevealWordOutput> = ({ gameId, row, col }) =>
  withEnv(({ adapters: { gamesRepository } }) =>
    pipe(
      adapt(gamesRepository.getById(gameId)),
      chain(game =>
        game
          ? actionOf(revealWordAction(row, col)(game))
          : actionErrorOf<DomainEnvironment, CodeNamesGame>(
              new ServiceError(`Game '${gameId}' does not exist`, ErrorCodes.NOT_FOUND),
            ),
      ),
      chain(game => adapt(gamesRepository.update(game))),
    ),
  )

const changeTurnAction = (game: CodeNamesGame) => ({
  ...game,
  turn: game.turn === Teams.red ? Teams.blue : Teams.red,
})

export const changeTurn: DomainPort<ChangeTurnInput, ChangeTurnOutput> = ({ gameId }) =>
  withEnv(({ adapters: { gamesRepository } }) =>
    pipe(
      adapt(gamesRepository.getById(gameId)),
      chain(game =>
        game
          ? actionOf(changeTurnAction(game))
          : actionErrorOf<DomainEnvironment, CodeNamesGame>(
              new ServiceError(`Game '${gameId}' does not exist`, ErrorCodes.NOT_FOUND),
            ),
      ),
      chain(game => adapt(gamesRepository.update(game))),
    ),
  )

export const gamesDomainPorts = {
  create,
  join,
  revealWord,
  changeTurn,
}

export type GamesDomainPorts = typeof gamesDomainPorts
