#! /bin/bash
./update.py
if [ "$1" = "m" ]; then
    DIR="/Library/WebServer/Documents/fantasy"
else
    DIR="/var/www/html/fantasy"
fi
sudo cp index.html ${DIR}
