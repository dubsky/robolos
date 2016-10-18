echo PREPARE FOR WIX

SET BASE=/cygdrive/c/Temp/rbsrc

rm -rf %BASE%
mkdir c:\Temp\rbsrc

cp -r ../../src/.electrify/.dist/robolos-win32-ia32/* %BASE%


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
rem mv %BASE%/resources/app/app/programs/server/npm/node_modules/mosca/node_modules/mqtt/node_modules/help-me %DEST%
rem mv %BASE%/resources/app/app/programs/server/node_modules/help-me/node_modules/glob-stream/node_modules/micromatch/node_modules/* %DEST%
rem rm -rf %BASE%/resources/app/app/programs/server/node_modules/help-me/node_modules/glob-stream
rem mv %BASE%/resources/app/app/programs/server/node_modules/node_modules/babel-types/node_modules/babel-traverse/node_modules/* %DEST%
rem mv %BASE%/resources/app/app/programs/server/npm/node_modules/serialport/node_modules/node-pre-gyp/node_modules/* %DEST%
rem mv %BASE%/resources/app/app/programs/server/node_modules/defs/node_modules/yargs/node_modules/cliui/node_modules/* %DEST%
rem mv %BASE%/resources/app/app/programs/server/npm/node_modules/meteor/cfs_storage-adapter/node_modules/* %DEST%
