#!/usr/bin/env bash
echo Performing Electrify
cd ../../src
electrify package -- --icon=public\favicon\favicon-96x96.icns
cd ../install/electrify
DIR=../../src/.electrify/.dist/robolos-darwin-x64
cp -R resources.osx/Contents $DIR/robolos.app
rm -rf out
mkdir out
/usr/bin/hdiutil create out/robolos-$VERSION-uncompressed.dmg -srcfolder $DIR
/usr/bin/hdiutil convert out/robolos-$VERSION-uncompressed.dmg -format UDZO  -imagekey zlib-level=9 -o out/robolos-$VERSION.dmg
rm out/robolos-$VERSION-uncompressed.dmg


