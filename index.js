// Imports
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
// My Routes
const stats = require('./routes/stats');
const next = require('./routes/next');
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
 * See `./routes/stats.js` for documentation of stats schema.
 */
app.get('/stats', stats.getStats);

/**
 * Route to provide JSON formatted information about next weeks NFL games.
 * See `./routes/next.js` for documentation of next schema.
 */
app.get('/next', next.getNext);

// Start up server
app.listen(PORT, () => console.log(`Stats app listening on port ${PORT}!`));
