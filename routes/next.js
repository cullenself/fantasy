// Imports
const request = require('request-promise-native');
const Buffer = require('Buffer');
const fs = require('fs');
// Custom
const helper = require('../helper');

/**
 * Try to retrieve and parse basic season stats from MySportsFeeds.
 * @returns {Object} next   Dictionary that follows schema from getNext()
 */
async function readNextAPI() {
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
        const next = {
          timestamp: msf.lastUpdatedOn, week, source: 'msf', games: [],
        };
        Object.values(msf.games).forEach((g) => {
          next.games.push({
            homeAbbreviation: g.schedule.homeTeam.abbreviation,
            awayAbbreviation: g.schedule.awayTeam.abbreviation,
          });
        });
        return next;
      });
  }
  const err = new Error('Token environment variable not set');
  err.code = 'TOKEN';
  throw err;
}

/**
 * Write NFL schedule to publicly accessible file to speed up response.
 * @write {Object} next     Dictionary that follows schema from getNext()
 */
function cache(stats) {
  fs.writeFile('./public/javascripts/next.json', JSON.stringify(stats), () => {});
}

/**
 * Express route to provide JSON formatted stats object with current NFL team information.
 * First tries a third-party API, then falls back on scraping the information.
 *
 * @response {Object} next                  Information about the next week's NFL games
 * @response {String} next.timestamp        ISO8601 date of last update
 * @response {Int}    next.week             Current NFL week, rolls over every Tues.
 * @response {String} next.source           Currently 'msf', indicating MySportsFeeds
 * @response {Array}  next.games            List of next week's matchups
 * @response {String} game.homeAbbreviation Home team abbreviation
 * @response {String} game.awayAbbreviation Away team abbreviation
 */
function getNext(req, res) {
  // Change to use a proper API
  readNextAPI()
    .then((next) => {
      res.jsonp(next);
      cache(next);
    });
}

/**
 * Make getStats available to other files
 */
module.exports = {
  getNext,
};
