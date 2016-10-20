#!/usr/bin/env bash
cd ../src
meteor npm install
meteor add-platform android
meteor build ../output --server http://ec2-52-39-102-127.us-west-2.compute.amazonaws.com:3000
mv ../output/src.tar.gz ../output/robolos-$OS-$ARCH-$VERSION.tar.gz
cd ../output/build/android/project
gradle wrapper --gradle-version 2.0
./gradlew
mv build/outputs/android-debug.apk ../../../robolos-$VERSION.apk
