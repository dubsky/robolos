cd ..
call meteor npm install
cd install
cd electrify
echo ELECTRIFY
call electrify.bat
cd ..
cd wix
call prepare.bat
call build.bat
