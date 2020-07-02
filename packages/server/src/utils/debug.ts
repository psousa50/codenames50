import { chain } from "fp-ts/lib/ReaderTaskEither"
import { Action, actionOf } from "./actions"

export const logDebug = console.log

export const lj = (m: string, d: unknown) => {
  console.log(m, ": ", JSON.stringify(d, null, 2))
  return d
}

export const chainLogRTEData = <I>(m: string, data: unknown) =>
  chain((v: I) => {
    logDebug(`${m}=>`, data)
    return actionOf(v)
  })

export const chainLogRTE = <E, I, R>(m: string, action: Action<E, I, R>) =>
  chain((v: I) => {
    logDebug(`${m}=>`, v)
    return action(v)
  })
