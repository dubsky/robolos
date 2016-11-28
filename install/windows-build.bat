cd ..\src
rem serialport previously installed using -g
rem call meteor npm install -g serialport@1.7.4
echo METEOR NPM INSTALL
call npm install
rem echo METEOR BUILD
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
