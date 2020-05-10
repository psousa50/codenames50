import { isNil } from "ramda"
import { toDateString } from "../../utils/dates"

export type Stringify<T> = {
  [k in keyof T]?: string
}

export const toNumber = (value?: string) => (isNil(value) ? undefined : Number.parseInt(value, 10))
export const toExistingNumber = (value: string) => Number.parseInt(value, 10)
export const toDate = (value?: string) => toDateString(value)
export const toTimeSlot = (value?: string) => value
export const toBoolean = (value?: string) => !isNil(value) && value.toUpperCase().substr(0, 1) === "Y"
