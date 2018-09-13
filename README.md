# Fantasy
Team Fantasy Football Tracker.

App using Node.js and Express, deployed via Heroku.

## Fantasy Football
Rather than the traditional "Fantasy Football," this league works by members drafting all professional NFL teams.
Whoever has the most accumulated wins at the end of the regular season wins the league.

## Configuration
Make sure [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) (not needed for local server) are installed.
```sh
git clone https://github.com/cullenself/fantasy.git # or your own fork
cd fantasy
heroku create # if deploying to Heroku
```

To setup the League initially, run `node setup.js` to create a `teams.json` file.
This is not required, a sample league configuration has been provided.

[comment]: # (TODO: implement, then add small gif)

### Optional API
For advanced functionality, the back end server tries to use a restricted API.
[MySportsFeed](https://www.mysportsfeeds.com/) allows the app to:
  - run faster.
  - display schedule information.
  - show scores of in-progress games.
  
The app still functions without using this API, falling back to scraping win information from the [news](http://stats.washingtonpost.com/fb/standings.asp).

To configure access:
```sh
export MSFTOKEN={apikey}
heroku config:set MSFTOKEN={apikey} -a {heroku_appname}
```


## Deployment
### Local
```sh
npm install
npm start
```
Visiting [localhost:5000](http://localhost:5000) should show something similar to the following:

![App Screenshot](https://github.com/cullenself/raw/master/screenshot)

### Heroku
The following creates a new app on Heroku and configures the local `git` repo, then deploys.
```sh
heroku create
git push heroku master
heroku open
```
See [Getting Started on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
for more information about basic app deployment.
