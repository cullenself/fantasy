// Imports
const request = require('request-promise-native');
const Buffer = require('Buffer');
const cheerio = require('cheerio');
const moment = require('moment');
const fs = require('fs');

/**
 * Try to retrieve and parse basic season stats from MySportsFeeds.
 * @returns {Object} stats  Dictionary that follows schema from getStats()
 */
async function readAPI() {
  const TOKEN = process.env.MSFTOKEN;
  if (TOKEN) {
    const options = {
      method: 'GET',
      url: 'https://api.mysportsfeeds.com/v2.0/pull/nfl/2018-regular/standings.json',
      headers: {
        Authorization: `Basic ${Buffer.from(`${TOKEN}:MYSPORTSFEEDS`).toString('base64')}`,
      },
      json: true,
      qs: {
        stats: 'W',
      },
    };
    return request(options)
      .then((msf) => {
      // Probably should add error handling, maybe cache backups
      // console.log(error); // TODO: remove
      // console.log(response);
        const stats = { timestamp: msf.lastUpdatedOn, source: 'msf', pro_teams: [] };
        Object.values(msf.teams).forEach((t) => {
          stats.pro_teams.push({
            name: `${t.team.city} ${t.team.name}`,
            abbreviation: t.team.abbreviation,
            wins: t.stats.standings.wins,
          });
        });
        return stats;
      });
  }
  const err = new Error('Token ENV variable not set');
  err.code = 'TOKEN';
  throw err;
}

/**
 * Scrape basic season stats from the Washington Post.
 * @returns {Object} stats  Dictionary that follows schema from getStats()
 */
async function readWP() {
  const options = {
    uri: 'http://stats.washingtonpost.com/fb/standings.asp',
    transform: body => cheerio.load(body),
  };
  return request(options)
    .then(($) => {
      const names = $('.shsRow0Row').find('.shsNonMobile').map((i, el) => $(el).text()).toArray()
        .concat(
          $('.shsRow1Row').find('.shsNonMobile').map((i, el) => $(el).text()).toArray(),
        );
      const abbrs = $('.shsRow0Row').find('.shsMobile').map((i, el) => $(el).text()).toArray()
        .concat(
          $('.shsRow1Row').find('.shsMobile').map((i, el) => $(el).text()).toArray(),
        );
      const wins = $('.shsRow0Row').map((i, el) => parseInt($(el).find('.shsTotD').first().text(), 10)).toArray().concat(
        $('.shsRow1Row').map((i, el) => parseInt($(el).find('.shsTotD').first().text(), 10)).toArray(),
      );
      const timestamp = moment($('#shsTimestamp').text().replace(/Last updated (\w+)\. (\d+), ((\d+):(\d{2})) (A\.M\.|P\.M\.) (\w+)/gm, '$2-$1T$3 $6 -4'), 'D-MMMTh:mm A Z').format();
      const stats = { timestamp, source: 'wp', pro_teams: [] };
      for (let i = 0; i < 32; i++) {
        stats.pro_teams.push({
          name: names[i],
          abbreviation: (abbrs[i] === 'LAR') ? 'LA' : abbrs[i].toUpperCase(),
          wins: wins[i],
        });
      }
      return stats;
    });
}

/**
 * Write NFL statistics to publicly accessible file to speed up response.
 * @write {Object} stats  Dictionary that follows schema from getStats()
 */
function cache(stats) {
  fs.writeFile('./public/javascripts/stats.json', JSON.stringify(stats), () => {});
}

/**
 * Express route to provide JSON formatted stats object with current NFL team information.
 * First tries a third-party API, then falls back on scraping the information.
 *
 * @response {Object} stats                         Dictionary containing pro_teams and timestamp
 * @response {String} stats.timestamp               Time of last update (ISO8601 formatted)
 * @response {String} stats.source                  Either 'msf' or 'wp'
 * @response {Array}  stats.pro_teams               Array containing NFL team dictionaries
 * @response {Object} pro_team (stats.pro_teams[i]) Dictionary of relevant values for each
 *                                                    Professional Team
 * @response {String} pro_team.name                 Team name (i.e. "Denver Broncos")
 * @response {String} pro_team.abbreviation         Team abbreviation (i.e. ("DEN"))
 * @response {Int}    pro_team.wins                 Team wins
 */
function getStats(req, res) {
  // Change to use a proper API
  readAPI()
    .catch(readWP)
    .then((stats) => {
      res.jsonp(stats);
      cache(stats);
    });
}

/**
 * Make getStats available to other files
 */
module.exports = {
  getStats,
};
