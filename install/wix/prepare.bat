echo PREPARE FOR WIX

rm -rf src
mkdir src

cp -r ../../src/.electrify/.dist/package/robolos-win32-ia32/* src


SET BASE=src
SET DEST=%BASE%/resources/app/app/programs/server/node_modules

mv %BASE%/resources/app/app/programs/server/npm/node_modules/meteor/babel-runtime/node_modules/regenerator/node_modules/* %DEST%
mv %BASE%/resources/app/app/programs/server/npm/node_modules/serialport/node_modules/node-pre-gyp/node_modules/request/node_modules/har-validator/node_modules/* %DEST%
mv %BASE%/resources/app/app/programs/server/npm/node_modules/meteor/babel-runtime/node_modules/regenerator/node_modules/defs/node_modules/yargs/node_modules/* %DEST%
mv %BASE%/resources/app/app/programs/server/npm/node_modules/serialport/node_modules/node-pre-gyp/node_modules/npmlog/node_modules/* %DEST%
mv %BASE%/resources/app/app/programs/server/npm/node_modules/meteor/babel-compiler/node_modules/meteor-babel/node_modules/* %DEST%
mv %BASE%/resources/app/app/programs/server/node_modules/babel-preset-react/node_modules/babel-plugin-transform-react-jsx/node_modules/babel-helper-builder-react-jsx/* %DEST%
mv %BASE%/resources/app/app/programs/server/npm/node_modules/meteor-node-stubs/node_modules/crypto-browserify/node_modules/* %DEST%
mv %BASE%/resources/app/app/programs/server/npm/node_modules/meteor/arboleya_electrify/node_modules/sockjs-client/node_modules/* %DEST%
mv %BASE%/resources/app/app/programs/server/npm/node_modules/serialport/node_modules/node-pre-gyp/node_modules/rimraf/node_modules/* %DEST%
