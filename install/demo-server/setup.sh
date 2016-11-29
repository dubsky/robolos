sudo apt-get install nginx mc
sudo mkdir /etc/nginx/ssl
#sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt
git clone https://dubsky@bitbucket.org/dubsky/robolos.git
sudo cp  robolos/install/keys/ec2-35-163-254-23/* /etc/nginx/ssl
cp oauth /etc/nginx/sites-available/oauth
chmod 0700 /etc/nginx/ssl
rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/oauth /etc/nginx/sites-enabled/oauth
curl https://install.meteor.com/ | sh
