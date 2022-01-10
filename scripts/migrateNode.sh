echo "Remove old Node Modules"
sudo rm -rf /usr/local/lib/node_modules

echo "Download Node 16.13.1"
wget https://nodejs.org/download/release/v16.13.1/node-v16.13.1-linux-armv7l.tar.gz

echo "Install Node 16.13.1"
tar -xvf node-v16.13.1-linux-armv7l.tar.gz >/dev/null 2>&1
sudo cp -R node-v16.13.1-linux-armv7l/* /usr/local/ >/dev/null 2>&1

echo "Remove Node File and Folder"
rm -rf node-v16.13.1-linux-armv7l.tar.gz
rm -rf node-v16.13.1-linux-armv7l

echo "Rebuild NPM"
npm rebuild
sudo npm rebuild
sudo npm rebuild -g

echo "Update NPM"
sudo npm install -g npm@latest node-gyp@latest

echo "Install Dependencies"
npm ci --only=prod