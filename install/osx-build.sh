#!/usr/bin/env bash
pwd
cd ../src
export PATH=$PATH:/usr/local/bin
meteor npm install
cd ../install
cd electrify
sh <electrify.sh
cd ../../src
meteor add-platform ios
meteor build ../output --server http://ec2-52-39-102-127.us-west-2.compute.amazonaws.com:3000
