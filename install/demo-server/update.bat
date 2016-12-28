mkdir tmp
cd tmp
wget http://elementary:8080/job/robolos-linux-intel/lastSuccessfulBuild/artifact/output/robolos-linux-intel-1.0.tar.gz
SET HOST=ec2-35-163-254-23.us-west-2.compute.amazonaws.com
chmod 400 ../../keys/robolos-cloud.pem
scp -i ../../keys/robolos-cloud.pem robolos-linux-intel-1.0.tar.gz ubuntu@%HOST%:/home/ubuntu
#ssh ubuntu@%HOST% 'sudo /home/ubuntu/update.sh'



