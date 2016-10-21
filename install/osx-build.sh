#!/usr/bin/env bash
pwd
cd ../src
export PATH=$PATH:/usr/local/bin
meteor npm install
echo Electrify
cd ../install
cd electrify
sh <electrify.sh
cd ../../src
echo Adding ios
meteor add-platform ios
echo Building
meteor build ../output --server http://ec2-52-39-102-127.us-west-2.compute.amazonaws.com:3000
echo Build finished
