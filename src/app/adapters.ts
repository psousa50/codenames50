import { DomainAdapter } from "../domain/adapters"
import { ActionResult, Action, ask as askAction } from "../utils/actions"

export type ExpressConfig = {
  port: number
}

export type ExpressAdapter = {
  config: ExpressConfig
  adapters: {
    domain: DomainAdapter
  }
}

export type ExpressActionResult<R = void> = ActionResult<ExpressAdapter, R>
export type ExpressAction<I = void, R = void> = Action<ExpressAdapter, I, R>

export function ask() {
  return askAction<ExpressAdapter>()
}
