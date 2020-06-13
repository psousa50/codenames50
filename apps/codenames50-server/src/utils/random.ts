export type RandomGenerator = () => number

export const shuffleWith = (random: RandomGenerator) => <T>(values: T[]) => {
  const newValues = values.slice()
  for (let i = newValues.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = newValues[i]
    newValues[i] = newValues[j]
    newValues[j] = tmp
  }

  return newValues
}

export const shuffle = shuffleWith(Math.random)
