cd ../../src
rm -rf .electrify/.dist
SET TEMP=F:\Temp
echo Temp location: %TEMP%
echo CWD: %cd%
call electrify package
echo Electrify done
cd ../install/electrify
echo CWD: %cd%
echo TO: %cd%/../../src/.electrify/.dist/robolos-win32-ia32
cp -R resources ../../src/.electrify/.dist/robolos-win32-ia32
