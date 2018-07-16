#!/usr/bin/env bash 

NODE_ENV=production node_modules/.bin/webpack --mode production
NODE_ENV=production node_modules/.bin/tsc
NODE_ENV=production docker-compose -p halicarnassus up -d --build