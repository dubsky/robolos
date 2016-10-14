cd ../../src
SET TEMP=F:\Temp
echo Temp location: %TEMP%
echo CWD: %cd%
call electrify package
echo Electrify done
cd ../install/electrify
cp -R resources ../../src/.electrify/.dist/robolos-win32-ia32
