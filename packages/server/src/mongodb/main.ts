import { Filter, MongoClient } from "mongodb"

type Stringable = {
  toString: () => string
}

export const connect = (mongoDbUri: string) => MongoClient.connect(mongoDbUri)

export const disconnect = (client: MongoClient) => client.close()

export const clearAll = (client: MongoClient) => client.db().dropDatabase()

export function getById<T>(collection: string) {
  return (id: Stringable) => (client: MongoClient) =>
    client
      .db()
      .collection<T>(collection)
      .findOne({ _id: id.toString() } as Filter<T>)
}

export function get<T>(collection: string) {
  return (query: Filter<unknown> = {}) =>
    (client: MongoClient) => {
      return client.db().collection<T>(collection).find(query).toArray()
    }
}

export const upsertManyById =
  <T extends { _id: string }>(collection: string) =>
  (data: T[]) =>
    upsertMany(collection)(data, (item: T) => ({ _id: item._id }) as Filter<T>)

const upsertMany =
  (collection: string) =>
  <T>(data: T[], filter: (item: T) => Filter<T> = _ => ({})) =>
  (client: MongoClient) =>
    Promise.all(
      data.map(item => client.db().collection(collection).updateOne(filter(item), { $set: item }, { upsert: true })),
    )
