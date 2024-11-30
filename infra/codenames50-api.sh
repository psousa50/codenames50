#!/bin/bash

APP_NAME=codenames50-api

heroku create $APP_NAME --remote heroku-api --region eu
heroku buildpacks:add heroku/nodejs --app $APP_NAME
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-multi-procfile --app $APP_NAME

heroku config:set PROCFILE=packages/server/Procfile --app $APP_NAME
heroku config:set BUILD_ENV=api --app $APP_NAME
heroku config:set MONGODB_URI="mongodb+srv://$MONGO_DB_USER:$MONGO_DB_PASS@$MONGO_DB_NAME/codenames50?retryWrites=true&w=majority" --app $APP_NAME
