import { MongoMemoryServer } from "mongodb-memory-server"
import { buildMongoEnvironment } from "../../src/mongodb/adapters"
import { gamesMongoDbPorts } from "../../src/mongodb/games"
import { connect } from "../../src/mongodb/main"
import { wordsMongoDbPorts } from "../../src/mongodb/words"
import { buildRepositoriesEnvironment } from "../../src/repositories/adapters"
import { wordsRepositoryPorts } from "../../src/repositories/words"
import { getRight } from "../helpers"

it("getByLanguage", async () => {
  const mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getUri()

  const dbClient = await connect(mongoUri)
  const mongoEnviroment = buildMongoEnvironment(dbClient)
  const repositoriesAdapter = buildRepositoriesEnvironment(mongoEnviroment, gamesMongoDbPorts, wordsMongoDbPorts)

  const wordsEn = {
    language: "en",
    words: ["word1", "word2"],
  }

  const wordsPt = {
    language: "pt",
    words: ["word1", "word2"],
  }

  await getRight(wordsRepositoryPorts.upsertByLanguage(wordsEn)(repositoriesAdapter))()
  await getRight(wordsRepositoryPorts.upsertByLanguage(wordsPt)(repositoriesAdapter))()

  const wPt = await getRight(wordsRepositoryPorts.getByLanguage("pt")(repositoriesAdapter))()
  const wEn = await getRight(wordsRepositoryPorts.getByLanguage("en")(repositoriesAdapter))()

  mongoServer.stop()

  expect(wPt?.language).toEqual("pt")
  expect(wEn?.language).toEqual("en")
})
