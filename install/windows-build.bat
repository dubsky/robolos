cd ..\src
rem serialport previously installed using -g
call npm install serialport@1.7.4
call meteor npm install
rem call meteor build ../out --server localhost:3000
cd ..
cd install
cd electrify
echo ELECTRIFY
call electrify.bat
cd ..
cd wix
call prepare.bat
call build.bat
