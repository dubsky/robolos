cd ../../src
electrify package
cd ../install/electrify
DIR=../../src/.electrify/.dist/robolos-darwin-x64
cp -R resources.osx/Contents $DIR/robolos.app
rm -rf out
mkdir out
hdiutil create -srcfolder $DIR out/robolos-$VERSION.dmg

