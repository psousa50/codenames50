#!/bin/bash

yarn workspace @psousa50/shared build
yarn workspace @codenames50/core build
yarn workspace @codenames50/messaging build
yarn workspace @codenames50/server build

yarn workspace @codenames50/core test
yarn workspace @codenames50/server test
