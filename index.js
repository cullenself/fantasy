// Imports
const express = require('express');
const request = require('request');
const helmet = require('helmet');
const Buffer = require('Buffer');
// Constants
const PORT = process.env.PORT || 5000;
const app = express();

// Set up Express securely
app.use(helmet());

// Serve pages in 'public' directory
app.use(express.static('public'));

/**
 * Route to provide JSON formatted stats object with current NFL team information.
 * @response {Object} stats                         Dictionary containing pro_teams and timestamp
 * @response {String} stats.timestamp               ISO8601 representation of time of last update
 * @response {Array}  stats.pro_teams               Array containing NFL team dictionaries
 * @response {Object} pro_team (stats.pro_teams[i]) Dictionary of relevant values for each
 *                                                    Professional Team
 * @response {String} pro_team.name                 Team name (i.e. "Denver Broncos")
 * @response {String} pro_team.abbreviation         Team abbreviation (i.e. ("DEN"))
 * @response {Int}    pro_team.wins                 Team wins
 */
app.get('/stats', (req, res) => {
  // Change to use a proper API
  const options = {
    method: 'GET',
    url: 'https://api.mysportsfeeds.com/v2.0/pull/nfl/2018-regular/standings.json',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.MSFTOKEN}:MYSPORTSFEEDS`).toString('base64')}`,
    },
    json: true,
    qs: {
      stats: 'standings',
    },
  };
  request(options, (error, response, body) => {
    // Probably should add error handling, maybe cache backups
    console.log(error); // TODO: remove
    console.log(response);
    const msf = JSON.parse(body);
    const stats = { timestamp: msf.lastUpdatedOn, teams: [] };
    Object.values(msf.teams).forEach((t) => {
      const team = {
        name: `${t.city}  ${t.name}`,
        abbreviation: t.abbreviation,
        wins: t.standings.wins,
      };
      stats.pro_teams.push(team);
    });
    res.jsonp(stats);
  });
});

// Start up server
app.listen(PORT, () => console.log(`Stats app listening on port ${PORT}!`));
