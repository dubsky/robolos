#!/usr/bin/env bash
cd ../src
meteor npm install
meteor add-platform android

echo Building
meteor build ../output --server http://ec2-52-39-102-127.us-west-2.compute.amazonaws.com:3000
echo Build finished
mv ../output/src.tar.gz ../output/robolos-$OS-$ARCH-$VERSION.tar.gz
#cd ../output/android/project
#echo Starting Gradle
#gradle -version
#gradle build
#echo Gradle finished
mv ../output/android/release-unsigned.apk ../output/robolos-$VERSION.apk
