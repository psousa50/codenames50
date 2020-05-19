export const logDebug = console.log

export const lj = (m: string, d: any) => {
  console.log(m, ": ", JSON.stringify(d, null, 2))
  return d
}
