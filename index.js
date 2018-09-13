// Imports
const express = require('express');
const request = require('request');
const helmet = require('helmet');
const Buffer = require("Buffer");
// Constants
const PORT = process.env.PORT || 5000;
const app = express();

// Set up Express securely
app.use(helmet());

// Serve pages in 'public' directory
app.use(express.static('public'));

/**
 * Route to provide JSON formatted stats object with current NFL team information.
 * @response {Array}  stats                 Array of pro_teams
 * @response {Object} pro_team              Dictionary of relevant values for each Professional Team
 * @response {String} pro_team.name         Team name
 * @response {String} pro_team.city         Team city
 * @response {String} pro_team.abbreviation Team abbreviation
 * @response {Int}    pro_team.wins         Team wins
 */
app.get('/stats', function (req, res) {
    // Change to use a proper API
    var options = {
        method: "GET",
        url: 'https://api.mysportsfeeds.com/v2.0/pull/nfl/2018-regular/standings.json',
        headers: {
            "Authorization": "Basic " + Buffer.from(process.env.MSFTOKEN + ":" + "MYSPORTSFEEDS").toString('base64')
        },
        json: true,
        qs: {
            stats: "standings"
        }
    };
    request(options, function(error, response, body) {
        console.log(error);
        console.log(response);
        console.log(body);
    });
    res.jsonp(stats);
});

// Start up server
app.listen(PORT, () => console.log(`Stats app listening on port ${ PORT }!`));
