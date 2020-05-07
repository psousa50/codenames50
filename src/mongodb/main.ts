import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither"
import { FilterQuery, MongoClient } from "mongodb"
import { ServiceError } from "../utils/audit"

export const connect = (mongoDbUri: string): TaskEither<ServiceError, MongoClient> =>
  tryCatch(
    () => MongoClient.connect(mongoDbUri, { useNewUrlParser: true, useUnifiedTopology: true }),
    error => new ServiceError((error as Error).message),
  )

export const disconnect = (client: MongoClient) => client.close()

export const clearAll = (client: MongoClient) => client.db().dropDatabase()

export function getById<T>(collection: string) {
  return (id: any) => (client: MongoClient) =>
    client
      .db()
      .collection<T>(collection)
      .findOne({ _id: id.toString() })
}

export function get<T>(collection: string) {
  return (query: FilterQuery<any> = {}) => (client: MongoClient) => {
    return client
      .db()
      .collection<T>(collection)
      .find(query)
      .toArray()
  }
}
export const upsertManyById = <T extends { _id: string }>(collection: string) => (data: T[]) =>
  upsertMany(collection)(data, (item: T) => ({ _id: item._id }))

const upsertMany = (collection: string) => <T>(data: T[], filter: (item: T) => {} = item => item) => (
  client: MongoClient,
) =>
  Promise.all(
    data.map(item =>
      client
        .db()
        .collection(collection)
        .updateOne(filter(item), { $set: item }, { upsert: true }),
    ),
  )
