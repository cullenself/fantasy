// Imports
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
// My Routes
const routes = require('./routes');
// Constants
const PORT = process.env.PORT || 5000;
const app = express();

// Set up Express securely
app.use(helmet());
app.use(compression());

// Serve pages in 'public' directory
app.use(express.static('public'));

/**
 * Route to provide JSON formatted stats object with current NFL team information.
 * @response {Object} stats                         Dictionary containing pro_teams and timestamp
 * @response {String} stats.timestamp               Time of last update (pre-formatted)
 * @response {Array}  stats.pro_teams               Array containing NFL team dictionaries
 * @response {Object} pro_team (stats.pro_teams[i]) Dictionary of relevant values for each
 *                                                    Professional Team
 * @response {String} pro_team.name                 Team name (i.e. "Denver Broncos")
 * @response {String} pro_team.abbreviation         Team abbreviation (i.e. ("DEN"))
 * @response {Int}    pro_team.wins                 Team wins
 */
app.get('/stats', routes.getStats);

// Start up server
app.listen(PORT, () => console.log(`Stats app listening on port ${PORT}!`));
