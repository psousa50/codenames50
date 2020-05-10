import { UUID } from "../utils/types"
import { Action } from "../utils/actions"

export type Insert<T> = Action<T, UUID>
export type GetById<T> = Action<string, T | null>

export interface Repository<NewT, T> {
  insert: Insert<NewT>
  getById: GetById<T>
}
