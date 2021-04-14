apt update
sudo apt update
curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
sudo apt-get install -y nodejs
node -v
git clone https://github.com/emipmttt/scraping-maindres-test.git
cd scraping-maindres-test
npm i 
npm i -g pm2
pm2 start src/nube.js