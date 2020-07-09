import { gamePorts } from "@codenames50/core"
import { Messages } from "@codenames50/messaging"
import { act, screen, waitFor } from "@testing-library/react"
import React from "react"
import { Environment } from "../../environment"
import { renderWithEnvironment, defaultEnvironment } from "../../_testHelpers/render"
import { PlayGameScreen } from "./PlayGameScreen"

describe("PlayGameScreen", () => {
  it("on server connection emits messages to register the user socket and to join the game", async () => {
    const userId = "Some Name"
    const gameId = "some-game-id"
    const emitMessage = jest.fn()

    const messageHandlers = {} as any
    const socketMessaging = {
      connect: () => {},
      disconnect: () => {},
      emitMessage: jest.fn(() => emitMessage),
      addMessageHandler: () => (handler: Messages.GameMessageHandler) => {
        messageHandlers[handler.type] = handler.handler
      },
    }

    const callMessagehandler = (messageType: Messages.GameMessageType) => messageHandlers[messageType]

    const environment: Environment = {
      ...defaultEnvironment,
      socketMessaging,
    } as any

    renderWithEnvironment(<PlayGameScreen gameId={gameId} userId={userId} />, environment)

    expect(screen.getByRole("progressbar")).toBeInTheDocument()
    expect(screen.queryByText(userId)).toBeNull()

    act(() => callMessagehandler("connect")())

    expect(emitMessage).toHaveBeenCalledWith(Messages.registerUserSocket({ userId }))
    expect(emitMessage).toHaveBeenCalledWith(Messages.joinGame({ gameId, userId }))

    const game = gamePorts.createGame("game-id", userId, Date.now())
    act(() => callMessagehandler("joinedGame")({ game }))

    await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument())
    expect(screen.queryAllByText(userId).length).toBeGreaterThan(0)
  })
})
