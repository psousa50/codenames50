import * as R from "ramda"

export const minDate = (dates: readonly Date[]) =>
  dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : undefined

export const flatten = <T>(list: T[][]) => list.reduce((acc, cur) => [...acc, ...cur], [] as T[])

export const max = <T>(col: T[]) =>
  col.length > 0 ? col.reduce((acc, d) => (acc ? (d > acc ? d : acc) : d), col[0]) : undefined
export const min = <T>(col: T[]) =>
  col.length > 0 ? col.reduce((acc, d) => (acc ? (d < acc ? d : acc) : d), col[0]) : undefined

export const updateCell = <T>(array: T[]) => (f: (value: T) => T, index: number) => {
  const newArray = R.clone(array)
  newArray[index] = f(array[index])
  return newArray
}

export const update2dCell = <T>(array: T[][]) => (f: (value: T) => T, row: number, col: number) => {
  const newArray = R.clone(array)
  newArray[row][col] = f(array[row][col])
  return newArray
}
