/**
 * Add event listener to table.
 */
function attachEvents() {
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
 * Render and Display HTML results.
 */
async function render(result) {
  const options = {
    weekday: 'short', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short',
  };
  const renderedTable = Mustache.render(window.tableTemplate, { score: result.score });
  const renderedFooter = Mustache.render(window.footerTemplate, { timestamp: (new Date(result.stats.timestamp)).toLocaleString('en-US', options) });
  $('tbody#table-target').html(renderedTable);
  $('div#footer-target').html(renderedFooter);
  $('td.hidden').hide();
  return result;
}

/**
 * Remove overlay from content and deactivate spinner.
 */
function removeOverlay() {
  $('.spinner-center').removeClass('active');
  $('.card-panel').removeClass('overlay');
}


/**
 * Updates `score` array for use in template.
 * Checks if fresher game schedule is available.
 *
 * @returns {Object} result           Dictionary of stats and processed participant information,
                                        either equivilant to loadCache(), or updated.
 */
async function updateNext(result) {
  const newNext = await $.getJSON('/next?callback=?');
  if (Date(newNext.timestamp) > Date(result.next.timestamp)) { // need to implement comparision
    return newNext;
  }
  return undefined;
}

/**
 * Generates `score` array for use in template.
 * Tries the cache first, API if missing.
 *
 * @returns {Object} result           Dictionary of processed scores and stats from cache
 * @returns {Array}  result.score     List of participants and relevant info
 * @returns {Object} score[i]         Dictionary of participant information
 * @returns {String} score[i].part    Name of Fantasy League participant
 * @returns {Int}    score[i].wins    Count of team wins
 * @returns {Array}  score[i].pros    List of pro-teams that participant has drafted
 * @returns {Object} score[i].pros[j] Dictionary of NFL team information, following
 *                                      schema from `/routes/stats.js`
 * @returns {Object} result.stats     Dictionary of NFL team information retrieved from back end
 * @returns {String} stats.timestamp  ISO8601 formatted string, time of last update
 * @returns {String} stats.source     Either 'wp' or 'msf' to denote Washington Post
 *                                      or MySportsFeed as source of data
 * @returns {Array}  stats.pro_teams  List of all pro-teams in NFL, following schema
 *                                      from `/routes/stats.js`
 */
async function loadCache() {
  return Promise.all([
    $.getJSON('/javascripts/teams.json'),
    $.getJSON('/javascripts/stats.json'),
    $.getJSON('/javascripts/next.json'),
  ]).catch((err) => {
    if (err.status === 404) {
      return Promise.all([
        $.getJSON('/javascripts/teams.json'),
        $.getJSON('/stats?callback=?'),
        $.getJSON('/next?callback=?'),
      ]);
    }
    throw err;
  }).then((results) => {
    const teams = results[0];
    const stats = results[1];
    const next = results[2];
    return { teams, stats, next };
  });
}

async function calcScore(result) {
  const score = [];
  const DATEOPT = { weekday: 'short', hour: 'numeric', minute: 'numeric' };
  Object.keys(result.teams).forEach((part) => {
    const temp = { part, wins: 0, pros: [] };
    Object.values(result.teams[part]).forEach((pro) => {
      const t = result.stats.pro_teams.find(p => p.name === pro);
      let match = result.next.games.find(g => g.homeAbbreviation === t.abbreviation);
      if (match !== undefined) {
        t.next = `vs. ${match.awayAbbreviation}, ${(new Date(match.gametime)).toLocaleDateString('en-US', DATEOPT)}`;
      } else {
        match = result.next.games.find(g => g.awayAbbreviation === t.abbreviation);
        t.next = `@ ${match.homeAbbreviation}, ${(new Date(match.gametime)).toLocaleDateString('en-US', DATEOPT)}`;
      }
      temp.pros.push(t);
    });
    temp.wins = temp.pros.reduce((acc, curr) => acc + curr.wins, 0);
    score.push(temp);
  });
  score.sort((first, second) => second.wins - first.wins);
  result.score = score;
  return result;
}

/**
 * Generates `score` array for use in template.
 * Checks if fresher standings are available.
 *
 * @returns {Object} result           Dictionary of stats and processed participant information,
                                        either equivilant to loadCache(), or updated.
 */
async function updateStats(result) {
  const newStats = await $.getJSON('/stats?callback=?');
  if (Date(newStats.timestamp) > Date(result.stats.timestamp)) { // need to implement comparision
    return newStats;
  }
  return undefined;
}

async function update(result) {
  return Promise.all([
    updateStats(result),
    updateNext(result),
  ]).then((results) => {
    const newStats = results[0];
    const newNext = results[0];
    if (newStats) {
      result.stats = newStats;
    }
    if (newNext) {
      result.next = newNext;
    }
    if (newStats || newNext) {
      return calcScore(result);
    }
    return result;
  });
}

/**
 * Fills in tbody.target with rendered template.
 */
function loadTable() {
  window.tableTemplate = $('script#table-template').html();
  Mustache.parse(window.tableTemplate); // provides speed benefit for multiple uses
  window.footerTemplate = $('script#footer-template').html();
  loadCache()
    .then(calcScore)
    .then(render)
    .then(update)
    .then(() => {
      attachEvents();
      removeOverlay();
    });
}
