export VERSION=1.0
export USER="v.dubsky@gmail.com"
export PASSWORD="m68hc11M68HC11"

./bitbucket.sh $USER $PASSWORD /dubsky/robolos-builds/downloads ../setup-linux-intel.sh
./bitbucket.sh $USER $PASSWORD /dubsky/robolos-builds/downloads ../setup-linux-arm.sh

mkdir work
cd work
wget http://elementary:8080/job/robolos-linux-intel/lastSuccessfulBuild/artifact/output/robolos-linux-intel-$VERSION.tar.gz 
../bitbucket.sh $USER $PASSWORD /dubsky/robolos-builds/downloads robolos-linux-intel-$VERSION.tar.gz 
wget http://elementary:8080/job/robolos-linux-arm/lastSuccessfulBuild/artifact/output/robolos-linux-arm-$VERSION.tar.gz 
../bitbucket.sh $USER $PASSWORD /dubsky/robolos-builds/downloads robolos-linux-arm-$VERSION.tar.gz 
cd ..
rm -rf work
rm uttb*
