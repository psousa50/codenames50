import { pipe } from "fp-ts/lib/pipeable"
import { chain, map } from "fp-ts/lib/ReaderTaskEither"
import * as R from "ramda"
import { actionErrorOf, actionOf, withEnv } from "../utils/actions"
import { adapt } from "../utils/adapters"
import { ErrorCodes, ServiceError } from "../utils/audit"
import { update2dCell } from "../utils/collections"
import { shuffle } from "../utils/random"
import { DomainPort } from "./adapters"
import {
  BoardWord,
  ChangeTurnInput,
  ChangeTurnOutput,
  CodeNamesGame,
  CreateGameInput,
  CreateGameOutput,
  GameStates,
  JoinGameInput,
  JoinGameOutput,
  RevealWordInput,
  RevealWordOutput,
  Teams,
  WordType,
} from "./models"

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

const buildBoard = (boardWidth: number, boardHeight: number) => (words: string[]): BoardWord[][] => {
  const wordTypes = determineWordTypes(words)
  return R.range(0, boardHeight).map(r => wordTypes.slice(r * boardWidth, r * boardWidth + boardWidth))
}

const exists = <E, T, R>(v: T | undefined, f: (v: NonNullable<T>) => R, errMsg: string) =>
  v ? actionOf(f(v!)) : actionErrorOf<E, R>(new ServiceError(errMsg, ErrorCodes.NOT_FOUND))

const insertGame = (userId: string): DomainPort<BoardWord[][], CodeNamesGame> => board =>
  withEnv(({ adapters: { gamesRepository, uuid, currentUtcDateTime } }) =>
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
  )

export const create: DomainPort<CreateGameInput, CreateGameOutput> = ({ userId, language }) =>
  withEnv(({ config: { boardWidth, boardHeight }, adapters: { wordsRepository } }) =>
    pipe(
      adapt(wordsRepository.getByLanguage(language)),
      chain(allWords =>
        exists(allWords, a => shuffle(a.words).slice(0, boardWidth * boardHeight), `Language '${language}' not found`),
      ),
      map(buildBoard(boardWidth, boardHeight)),
      chain(insertGame(userId)),
    ),
  )

export const join: DomainPort<JoinGameInput, JoinGameOutput> = ({ gameId, userId }) =>
  withEnv(({ adapters: { gamesRepository } }) =>
    pipe(
      adapt(gamesRepository.getById(gameId)),
      chain(game => exists(game, addPlayer(userId), `Game '${gameId}' does not exist`)),
      chain(game => adapt(gamesRepository.update(game))),
    ),
  )

const reveal = (w: BoardWord) => ({ ...w, revealed: true })
const revealWordAction = (row: number, col: number) => (game: CodeNamesGame) => ({
  ...game,
  board: update2dCell(game.board)(reveal, row, col),
})

export const revealWord: DomainPort<RevealWordInput, RevealWordOutput> = ({ gameId, row, col }) =>
  withEnv(({ adapters: { gamesRepository } }) =>
    pipe(
      adapt(gamesRepository.getById(gameId)),
      chain(game => exists(game, revealWordAction(row, col), `Game '${gameId}' does not exist`)),
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
      chain(game => exists(game, changeTurnAction, `Game '${gameId}' does not exist`)),
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
