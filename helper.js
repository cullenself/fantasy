// Imports
const moment = require('moment');

function getNFLWeek() {
  return moment().diff('2018-09-04', 'weeks') + 1;
}
function getStartOfWeek() {
  return moment('2018-09-04').add(getNFLWeek() - 1, 'w').format('YYYYMMDD');
}

module.exports = {
  getNFLWeek,
  getStartOfWeek,
};
