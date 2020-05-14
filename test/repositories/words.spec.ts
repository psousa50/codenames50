import { MongoMemoryServer } from "mongodb-memory-server"
import { connect } from "../../src/mongodb/main"
import { wordsRepositoryPorts } from "../../src/repositories/words"
import { getRight, buildTestRepositoriesEnvironment } from "../helpers"

it("getByLanguage", async () => {
  const mongoServer = new MongoMemoryServer()
  const mongoUri = await mongoServer.getUri()

  const dbClient = await connect(mongoUri)
  const repositoriesAdapter = buildTestRepositoriesEnvironment(dbClient)

  const wordsEn = {
    language: "en",
    words: ["word1", "word2"],
  }

  const wordsPt = {
    language: "pt",
    words: ["word1", "word2"],
  }

  await getRight(wordsRepositoryPorts.insert(wordsEn)(repositoriesAdapter))()
  await getRight(wordsRepositoryPorts.insert(wordsPt)(repositoriesAdapter))()

  const wPt = await getRight(wordsRepositoryPorts.getByLanguage("pt")(repositoriesAdapter))()
  const wEn = await getRight(wordsRepositoryPorts.getByLanguage("en")(repositoriesAdapter))()

  mongoServer.stop()

  expect(wPt).toEqual(wordsPt)
  expect(wEn).toEqual(wordsEn)
})
