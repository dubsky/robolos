cd ../../src
rm -rf .electrify/.dist

rm -rf /cygdrive/c/Users/Vlada/AppData/Local/Temp/electron-packager
rm -rf /cygdrive/c/Users/Vlada/AppData/Local/Temp/electrify

rem SET TEMP=F:\Temp
echo Temp location: %TEMP%
echo CWD: %cd%
call electrify package -- --icon=public\favicon\favicon-96x96.ico
echo Electrify done
cd ../install/electrify
echo CWD: %cd%
echo TO: %cd%/../../src/.electrify/.dist/robolos-win32-ia32
cp -R resources ../../src/.electrify/.dist/robolos-win32-ia32
