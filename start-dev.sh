#!/usr/bin/env bash

node_modules/.bin/webpack --mode development
node_modules/.bin/tsc
docker-compose -p civslog -f docker-compose-dev.yml up --build