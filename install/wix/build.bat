echo WIX

rm -rf out
mkdir out
cd out

#SET SRC=C:\Files\robolos\src\.electrify\.dist\robolos-win32-ia32
SET SRC=c:\Temp\rbsrc
#SET WIX="C:\Program Files (x86)\WiX Toolset v3.11\bin"
SET WIX="C:\Program Files (x86)\Windows Installer XML v3.5"
%WIX%\bin\heat.exe dir %SRC% -srd -dr INSTALLDIR -cg MainComponentGroup -out directory.wxs -ke -sfrag -gg -var var.SourceDir -sreg -scom
%WIX%\bin\candle -dSourceDir=%SRC% -dDbSourceDir=%SRC%/resources/app/db ../robolos.wxs directory.wxs
%WIX%\bin\light -cultures:en-US *.wixobj -o robolos-desktop-1.0.msi
