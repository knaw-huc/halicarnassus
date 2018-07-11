#!/usr/bin/env bash 

node_modules/.bin/webpack --mode production
node_modules/.bin/tsc
docker-compose -p civslog up --build