import { RevealWordInput, CreateGameInput, JoinGameInput, CodeNamesGame, ChangeTurnInput } from "../../domain/models"
import { createSocketMessage } from "./messagesTypes"

export const createGame = (data: CreateGameInput) => createSocketMessage("createGame", data)
export const gameCreated = (data: CodeNamesGame) => createSocketMessage("gameCreated", data)
export const joinGame = (data: JoinGameInput) => createSocketMessage("joinGame", data)
export const joinedGame = (data: CodeNamesGame) => createSocketMessage("joinedGame", data)
export const revealWord = (data: RevealWordInput) => createSocketMessage("revealWord", data)
export const changeTurn = (data: ChangeTurnInput) => createSocketMessage("changeTurn", data)
