// Imports
const express = require('express');
const request = require('request');
const helmet = require('helmet');
const jsdom = require("jsdom");
// Constants
const PORT = process.env.PORT || 5000;
const { JSDOM } = jsdom;
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
    request('http://stats.washingtonpost.com/fb/standings.asp', function (err, resp, body) {
        const { document } = (new JSDOM(body)).window;
        var r = Array.from(document.getElementsByClassName('shsRow0Row'));
        r = r.concat(Array.from(document.getElementsByClassName('shsRow1Row')));
        var stats = {};
        for (var i = 0; i<r.length; i++) {
            name = r[i].children[0].children[0].textContent;
            wins = parseInt(r[i].children[1].textContent);
            stats[name] = wins;
        }
    res.jsonp(stats);
    });
});

// Start up server
app.listen(PORT, () => console.log(`Stats app listening on port ${ PORT }!`));
