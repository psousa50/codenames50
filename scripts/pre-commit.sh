#!/bin/bash

yarn clean
yarn build

yarn workspace @codenames50/server test

./scripts/start-server.sh
