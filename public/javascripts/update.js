function loadUser() {
  var template = $('#template').html();
  Mustache.parse(template);   // optional, speeds up future uses
  var rendered = Mustache.render(template, {name: "Luke"});
  $('#target').html(rendered);
}

function loadTable() {
    var template = $('#template').html();
    Mustache.parse(template);   // optional, speeds up future uses
    updateScore( function(scores) { 
        var rendered = Mustache.render(template, {score:scores});
        $('#target').html(rendered);
        hidePros();
    });
}

function updateScore(callback) {
    loadTeams(function(teams) {
        loadStats(function(stats) {
            var score = [] 
            for (var part in teams) {
                var temp = {'part':part, 'wins':0, 'pros':[]};
                for (var pro in teams[part]) {
                    temp.pros.push(stats.pro_teams[pro]);
                }
                temp.wins = temp.pros.reduce( (acc, curr) => acc + curr.wins, 0 );
                score.push(temp);
            }
            score.sort( (first, second) => second.wins - first.wins );
            callback(score);
        })
    });
}

function loadTeams(callback) {
    $.getJSON('/javascripts/teams.json', callback);
}

function loadStats(callback) {
    // Updating the stats is implemented with express server on backend
    $.getJSON('/stats?callback=?', callback);
}

function hidePros() {
    $("td.hidden").hide();
    $("table#top").click( function(event) {
        event.stopPropagation();
        var $target = $(event.target);
        if ($target.closest("td").hasClass("hidden")) {
            $target.closest("td").slideToggle();
        } else if ($target.closest("tr.main").children("td").hasClass("hidden")) {
            $target.closest("tr.main").children("td").slideToggle();
        } else {
            $target.closest("tr.main").next().children(".hidden").slideToggle();
        }
    });
}
