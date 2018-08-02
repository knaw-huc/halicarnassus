#!/usr/bin/env bash

NODE_ENV=development node_modules/.bin/webpack --mode development
NODE_ENV=development node_modules/.bin/tsc
docker-compose -p halicarnassus -f docker-compose-dev.yml up --build

