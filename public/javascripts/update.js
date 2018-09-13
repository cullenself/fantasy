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
async function updateScore() {
  const results = await Promise.all([
    $.getJSON('/javascripts/teams.json'),
    //    $.getJSON('/stats?callback=?'),
    $.getJSON('/javascripts/stats.json'),
  ]);
  const score = [];
  const teams = results[0];
  const stats = results[1];
  Object.keys(teams).forEach((part) => {
    const temp = { part, wins: 0, pros: [] };
    Object.values(teams[part]).forEach((pro) => {
      temp.pros.push(stats.pro_teams.find(p => p.name === pro));
    });
    temp.wins = temp.pros.reduce((acc, curr) => acc + curr.wins, 0);
    score.push(temp);
  });
  score.sort((first, second) => second.wins - first.wins);
  return score;
}

/**
 * Fills in tbody.target with rendered template.
 */
function loadTable() {
  const template = $('#template').html();
  updateScore().then((score) => {
    const rendered = Mustache.render(template, { score });
    $('#target').html(rendered);
    hidePros();
  });
}
