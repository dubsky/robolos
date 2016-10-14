#!/usr/bin/env bash
cd ../src
meteor npm install
meteor add-platform android
meteor build ../output
mv ../output/src.tar.gz ../output/robolos-$OS-$ARCH-$VERSION.tar.gz
