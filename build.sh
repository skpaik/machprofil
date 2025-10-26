#!/usr/bin/env bash

#npm install
npm run build
#npm run export

rm -rf docs/*
cp -r out/* docs/
git add docs
git commit -m "Deploy Next.js static export"
git push
