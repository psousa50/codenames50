#!/bin/bash

APP_NAME=codenames50-api

heroku create $APP_NAME --remote heroku-api --region eu
heroku buildpacks:add heroku/nodejs --app $APP_NAME
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-multi-procfile --app $APP_NAME
heroku addons:create mongolab:sandbox --app $APP_NAME

heroku config:set PROCFILE=projects/apps/codenames50-server/Procfile --app $APP_NAME
heroku config:set BUILD_ENV=api --app $APP_NAME
