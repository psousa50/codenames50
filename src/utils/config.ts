export const localApi = {
  irnPort: 3000,
  irnUrl: "http://localhost",
}

export const productionApi = {
  irnPort: undefined,
  irnUrl: "https://xxx.herokuapp.com",
}

const developmentConfig = {
  ...localApi,
}

const productionConfig = {
  ...productionApi,
}

export const config = developmentConfig
