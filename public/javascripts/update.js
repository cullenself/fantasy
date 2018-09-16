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
 * Generates `score` array for use in template.
 * Tries the cache first, API if missing.
 *
 * @returns {Object}   result         Dictionary of processed scores and stats from cache
 * @returns {Object}   result.stats   Dictionary of NFL team information retrieved from back end
 *                                      Schema from `/routes/stats.js`
 * @returns {Object}   result.sched   Dictionary of latest NFL schedule information
 *                                      Schema from `/routes/sched.js`
 * @returns {Object}   result.teams   Dictionary of team assignments
 * @returns {String}   teams.keys()   Names of participants
 * @returns {String[]} teams.values() Drafted teams corresponding to participant
 */
async function loadCache() {
  return Promise.all([
    $.getJSON('/javascripts/teams.json'),
    $.getJSON('/javascripts/stats.json'),
    $.getJSON('/javascripts/sched.json'),
  ]).catch((err) => {
    if (err.status === 404) {
      return Promise.all([
        $.getJSON('/javascripts/teams.json'),
        $.getJSON('/stats?callback=?'),
        $.getJSON('/sched?callback=?'),
      ]).catch((err2) => {
        if (err2.responseText === 'undefined') {
          return Promise.all([
            $.getJSON('/javascripts/teams.json'),
            $.getJSON('/stats?callback=?'),
          ]);
        }
        throw err2;
      });
    }
    throw err;
  }).then((results) => {
    const teams = results[0];
    const stats = results[1];
    const sched = results[2];
    return { teams, stats, sched };
  });
}

/**
 * Process gathered data to yield several template strings.
 *
 * @params  {Object} result           Must contain `teams`, `stats`, and `sched` dictionaries.
 *
 * @returns {Array}  result.score     List of participants and relevant info
 * @returns {Object} score[i]         Dictionary of participant information
 * @returns {String} score[i].part    Name of Fantasy League participant
 * @returns {Int}    score[i].wins    Count of team wins
 * @returns {Array}  score[i].pros    List of pro-teams that participant has drafted
 * @returns {Object} score[i].pros[j] Dictionary of NFL team information, similar to
 *                                      schema from `/routes/stats.js`, with the addition of a
 *                                      `nextGame` string
 */
function calcScore(result) {
  const score = [];
  const DATEOPT = { weekday: 'short', hour: 'numeric', minute: 'numeric' };
  Object.keys(result.teams).forEach((part) => {
    const temp = { part, wins: 0, pros: [] };
    Object.values(result.teams[part]).forEach((pro) => {
      const t = result.stats.pro_teams.find(p => p.name === pro);
      if (result.sched) {
        // Check if team is home
        let match = result.sched.games.find(g => g.homeAbbreviation === t.abbreviation);
        const home = (match !== undefined);
        // Next check if the team is away
        match = match || result.sched.games.find(g => g.awayAbbreviation === t.abbreviation);
        if (match !== undefined) { // if still undefined, then it's a bye week
          const at = home ? 'vs.' : '@';
          const opp = home ? match.awayAbbreviation : match.homeAbbreviation;
          let gameScore = `${Math.max(match.homeScore, match.awayScore)}-${Math.min(match.homeScore, match.awayScore)}`;
          let winning = (home === (match.homeScore > match.awayScore));
          const tie = match.homeScore === match.awayScore;
          let time;
          switch (match.complete) {
            case 'UNPLAYED':
              time = (new Date(match.gametime)).toLocaleDateString('en-US', DATEOPT);
              winning = '';
              gameScore = '';
              break;
            case 'LIVE':
              time = `${match.quarter}${['st', 'nd', 'rd', 'th'][match.quarter - 1]} Quarter`;
              winning = winning ? 'Up' : 'Down';
              winning = tie ? 'Tied' : winning;
              break;
            default:
              time = '';
              winning = winning ? 'W' : 'L';
          }
          t.nextGame = `${winning} ${gameScore} ${at} ${opp} ${time}`; // compile info string
        } else {
          t.nextGame = 'Bye';
        }
      }
      temp.pros.push(t);
    });
    temp.pros.sort((first, second) => second.wins - first.wins);
    temp.wins = temp.pros.reduce((acc, curr) => acc + curr.wins, 0);
    score.push(temp);
  });
  score.sort((first, second) => second.wins - first.wins);
  result.score = score;
  return result;
}

/**
 * Checks if fresher game schedule is available.
 *
 * @returns {Object} sched  Dictionary of NFL schedule, see schema description
 *                            in `/routes/sched.js`, if `result` already contains
 *                            latest info, `sched` is undefined
 */
async function updateSched(result) {
  const newSched = await $.getJSON('/sched?callback=?')
    .catch((err) => {
      if (err.responseText === 'undefined') {
        return undefined;
      }
      throw err;
    });
  if (newSched) {
    if (!result.sched || Date(newSched.timestamp) > Date(result.sched.timestamp)) {
      return newSched;
    }
  }
  return undefined;
}

/**
 * Checks if fresher standings are available.
 *
 * @returns {Object} stats  Dictionary of current NFL standings, see schema in `/routes/stats.js`,
 *                            if `result` already contains latest info, `stats` is undefined
 */
async function updateStats(result) {
  const newStats = await $.getJSON('/stats?callback=?')
    .catch((err) => {
      if (err.responseText === 'undefined') {
        return undefined;
      }
      throw err;
    });
  if (newStats) {
    if (!result.stats || Date(newStats.timestamp) > Date(result.stats.timestamp)) {
      return newStats;
    }
  }
  return undefined;
}

/**
 * Fetch latest information from back end and display.
 * @param  {Object} result  Dictionary of stats and other information
 * @return {Object} result  Same as input, potentially updated
 */
async function update(result) {
  return Promise.all([
    updateStats(result),
    updateSched(result),
  ]).then((results) => {
    const newStats = results[0];
    const newSched = results[1];
    if (newStats) {
      result.stats = newStats;
    }
    if (newSched) {
      result.sched = newSched;
    }
    if (newStats || newSched) {
      return render(calcScore(result));
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
