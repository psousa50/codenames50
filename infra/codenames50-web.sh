#!/bin/bash

APP_NAME=codenames50-web

heroku create $APP_NAME --remote heroku-web --region eu
heroku buildpacks:add heroku/nodejs --app $APP_NAME
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-multi-procfile --app $APP_NAME

heroku config:set PROCFILE=packages/web/Procfile --app $APP_NAME
heroku config:set REACT_APP_SERVER_URL=https://codenames50-api.herokuapp.com --app $APP_NAME
