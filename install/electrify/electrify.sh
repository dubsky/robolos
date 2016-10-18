cd ../../src
electrify package -- --icon=public\favicon\favicon-96x96.icns
cd ../install/electrify
DIR=../../src/.electrify/.dist/robolos-darwin-x64
cp -R resources.osx/Contents $DIR/robolos.app
rm -rf out
mkdir out
/usr/bin/hdiutil create -srcfolder $DIR out/robolos-$VERSION.dmg

