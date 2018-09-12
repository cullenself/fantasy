#! /bin/bash
#./update.py
if [ "$1" = "m" ]; then
    DIR="/Library/WebServer/Documents/fantasy"
else
    DIR="/var/www/html/fantasy"
fi
sudo cp index.html ${DIR}
sudo cp teams.json ${DIR}
sudo cp stats.json ${DIR}
sudo cp update.js ${DIR}
sudo cp mustache.min.js ${DIR}
