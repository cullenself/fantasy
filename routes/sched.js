// Imports
const request = require('request-promise-native');
const Buffer = require('Buffer');
const fs = require('fs');
// Custom
const helper = require('../helper');

/**
 * Try to retrieve and parse basic season stats from MySportsFeeds.
 * @returns {Object} sched   Dictionary that follows schema from getSched()
 */
async function readSchedAPI() {
  const TOKEN = process.env.MSFTOKEN;
  if (TOKEN) {
    const week = helper.getNFLWeek();
    const options = {
      method: 'GET',
      url: `https://api.mysportsfeeds.com/v2.0/pull/nfl/2018-regular/week/${week}/games.json`,
      headers: {
        Authorization: `Basic ${Buffer.from(`${TOKEN}:MYSPORTSFEEDS`).toString('base64')}`,
      },
      json: true,
    };
    return request(options)
      .then((msf) => {
        const sched = {
          timestamp: msf.lastUpdatedOn, week, source: 'msf', games: [],
        };
        Object.values(msf.games).forEach((g) => {
          sched.games.push({
            homeAbbreviation: g.schedule.homeTeam.abbreviation,
            awayAbbreviation: g.schedule.awayTeam.abbreviation,
            homeScore: g.score.homeScoreTotal,
            awayScore: g.score.awayScoreTotal,
            gametime: g.schedule.startTime,
            complete: g.schedule.playedStatus,
          });
        });
        return sched;
      });
  }
  const err = new Error('Token environment variable not set');
  err.code = 'TOKEN';
  throw err;
}

/**
 * Write NFL schedule to publicly accessible file to speed up response.
 * @write {Object} sched     Dictionary that follows schema from getSched()
 */
function cache(stats) {
  fs.writeFile('./public/javascripts/sched.json', JSON.stringify(stats), () => {});
}

/**
 * Express route to provide JSON formatted stats object with current NFL team information.
 * First tries a third-party API, then falls back on scraping the information.
 *
 * @response {Object} sched                  Information about the next week's NFL games
 * @response {String} sched.timestamp        ISO8601 date of last update
 * @response {Int}    sched.week             Current NFL week, rolls over every Tues.
 * @response {String} sched.source           Currently 'msf', indicating MySportsFeeds
 * @response {Array}  sched.games            List of next week's matchups
 * @response {String} game.homeAbbreviation Home team abbreviation
 * @response {String} game.awayAbbreviation Away team abbreviation
 * @response {String} game.gametime         ISO8601 time of next game
 */
function getSched(req, res) {
  // Change to use a proper API
  readSchedAPI()
    .then((sched) => {
      res.jsonp(sched);
      cache(sched);
    })
    .catch((err) => {
      if (err.code === 'TOKEN') {
        res.send('undefined');
      } else {
        throw err;
      }
    });
}

/**
 * Make getSched available to other files
 */
module.exports = {
  getSched,
};
