/**
 * Reads team listings.
 */
function loadTeams(callback) {
  $.getJSON('/javascripts/teams.json', callback);
}

/**
 * Get current NFL team information.
 */
function loadStats(callback) {
  // Updating the stats is implemented with express server on backend
  $.getJSON('/stats?callback=?', callback);
}

/**
 * Hide team assignments on first load, then add event listener to table.
 */
function hidePros() {
  $('td.hidden').hide();
  $('table#top').click((event) => {
    event.stopPropagation();
    const $target = $(event.target);
    if ($target.closest('td').hasClass('hidden')) { // clicked on row that contains table of NFL teams
      $target.closest('td').slideToggle();
    } else if ($target.closest('tr.main').children('td').hasClass('hidden')) { // clicked inside table of NFL teams
      $target.closest('tr.main').children('td').slideToggle();
    } else { // clicked on participant row
      $target.closest('tr.main').next().children('.hidden').slideToggle();
    }
  });
}

/**
 * Generates `score` array for use in template.
 * @returns {Array}  score            List of participants and relevant info
 * @returns {Object} score[i]         Dictionary of participant information
 * @returns {String} score[i].part    Name of Fantasy League participant
 * @returns {Int}    score[i].wins    Count of team wins
 * @returns {Array}  score[i].pros    List of pro-teams that participant has drafted
 * @returns {Object} score[i].pros[j] Dictionary of NFL team information, following
 *                                      schema from `index.js
 */
function updateScore(callback) {
  loadTeams((teams) => {
    loadStats((stats) => {
      const score = [];
      Object.keys(teams).forEach((part) => {
        const temp = { part, wins: 0, pros: [] };
        Object.values(teams[part]).forEach((pro) => {
          temp.pros.push(stats.pro_teams[pro]);
        });
        temp.wins = temp.pros.reduce((acc, curr) => acc + curr.wins, 0);
        score.push(temp);
      });
      score.sort((first, second) => second.wins - first.wins);
      callback(score);
    });
  });
}

/**
 * Fills in tbody.target with rendered template.
 */
function loadTable() {
  const template = $('#template').html();
  updateScore((scores) => {
    const rendered = Mustache.render(template, { score: scores });
    $('#target').html(rendered);
    hidePros();
  });
}
