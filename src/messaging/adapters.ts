import socketIo from "socket.io"
import { Port } from "../utils/adapters"
import { messengerPorts } from "./messenger"

const messengerAdapters = {
  emit: messengerPorts.emit({} as any),
  broadcast: messengerPorts.broadcast({} as any),
}
type MessengerAdapters = typeof messengerAdapters

export type GameMessagingEnvironment = {
  adapters: {
    messenger: MessengerAdapters
  }
}

export type GameMessagingPort<I = void, R = void> = Port<GameMessagingEnvironment, I, R>

export const buildMessagingAdapter = (io: socketIo.Server): GameMessagingEnvironment => ({
  adapters: {
    messenger: {
      emit: messengerPorts.emit(io),
      broadcast: messengerPorts.broadcast(io),
    },
  },
})
