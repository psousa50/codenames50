import { keys } from "ramda"

export const removeUndefined = (o: Record<string, unknown>) =>
  keys(o).reduce((acc, k) => ({ ...acc, ...(o[k] === undefined ? {} : { [k]: o[k] }) }), {})
