cd ..\src
rem call meteor npm install
call meteor build ../out --server localhost:3000
cd ..
cd install
cd electrify
echo ELECTRIFY
call electrify.bat
cd ..
cd wix
call prepare.bat
call build.bat
