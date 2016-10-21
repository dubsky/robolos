#!/usr/bin/env bash
RUSER=robolos
RVERSION=1.0
apt-get install wget make g++ build-essential libssl-dev libkrb5-dev libzmq-dev mongodb-server libavahi-compat-libdnssd-dev
adduser --disabled-login $RUSER
DIR=$( getent passwd "$RUSER" | cut -d: -f6 )
cd $DIR
rm -rf bundle .npm node robolos* node*
# download node.js
wget https://nodejs.org/dist/v0.10.46/node-v0.10.46-linux-x64.tar.gz
tar xzf node-v0.10.46-linux-x64.tar.gz.
ln -s node-v0.10.46-linux-x64 node

# download and prepare robolos
wget https://bitbucket.org/dubsky/robolos-builds/downloads/robolos-linux-arm-$VERSION.tar.gz
tar xzf robolos-linux-intel-$VERSION.tar.gz
chown -R $RUSER:$RUSER node bundle
(cd bundle/programs/server && su robolos -c '../../../node/bin/npm install')

echo export PORT=3000 > /etc/robolos.conf
echo export MONGO_URL='mongodb://localhost:27017/robolos' >> /etc/robolos.conf
echo export ROOT_URL="http://`hostname`:3000/" >> /etc/robolos.conf
service mongodb start

cat > /etc/init/robolos.conf << EndOfUpstart
description "Robolos"
author "Vladimir Dubsky"

# When to start the service
start on runlevel [2345]

# When to stop the service
stop on runlevel [016]

# Automatically restart process if crashed
respawn

# Start the process
exec su - robolos -c ". /etc/robolos.conf && cd /home/robolos/bundle && /home/robolos/node/bin/node main.js"
EndOfUpstart

service robolos start
