mkdir tmp
cd tmp
wget http://192.168.1.146:8080/job/robolos-linux-intel/lastSuccessfulBuild/artifact/output/robolos-linux-intel-1.0.tar.gz
SET HOST=ec2-35-163-254-23.us-west-2.compute.amazonaws.com
scp -i ../../keys/robolos-demo.pem robolos-linux-intel-1.0.tar.gz ubuntu@%HOST%:/home/robolos
ssh ubuntu@%HOST% 'sudo /home/ubuntu/update.sh'



