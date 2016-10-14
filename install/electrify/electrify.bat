cd ../../src
SET TEMP=F:\Temp
echo Temp location: %TEMP%
call electrify package
cd ../install/electrify
cp -R resources ../../src/.electrify/.dist/robolos-win32-ia32
