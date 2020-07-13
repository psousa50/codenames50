#!/bin/bash

yarn clean
yarn build

yarn workspace @codenames50/core test
yarn workspace @codenames50/server test
yarn workspace @codenames50/web test

yarn lint

./scripts/start-server.sh
