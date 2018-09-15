// Imports
const moment = require('moment');

function getNFLWeek() {
  return moment().diff('2018-09-04', 'weeks') + 1;
}

module.exports = {
  getNFLWeek,
};
