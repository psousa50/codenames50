import { Messages } from "@codenames50/messaging"
import { Environment } from "../environment"
import { actionOf } from "../utils/actions"

export const defaultEnvironment: Environment = {
  config: {},
  api: {
    getLanguages: () => actionOf([]),
    getTurnTimeouts: () => actionOf([{ timeoutSec: 0 }]),
  },
  useSound: () => [jest.fn()],
} as any

export const buildEnvironment = () => {
  const messageHandlers = {} as any
  const emitMessage = jest.fn()
  const socketMessaging = {
    connect: () => {},
    disconnect: () => {},
    emitMessage,
    addMessageHandler: (handler: Messages.GameMessageHandler) => {
      messageHandlers[handler.type] = handler.handler
    },
  }

  const simulateMessageFromServer = <T>(message: Messages.GameMessage<T>) => {
    messageHandlers[message.type](message.data)
  }

  const environment = {
    ...defaultEnvironment,
    socketMessaging,
  } as any

  return {
    simulateMessageFromServer,
    emitMessage,
    environment,
  }
}
