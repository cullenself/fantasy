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
    });
    //var rendered = Mustache.render(template, {score:score});
    //$('#target').html(rendered);
}

function updateScore(callback) {
    loadTeams(function(teams) {
        loadStats(function(stats) {
            var score = [] 
            for (var part in teams) {
                var temp = {'part':part, 'wins':0};
                for (var pro in teams[part]) {
                    temp['wins'] += stats[teams[part][pro]];
                }
                score.push(temp);
            }
            score.sort(function(first,second) {
                return second['wins'] - first['wins'];
            });
            callback(score);
        })
    });
}

function loadTeams(callback) {
    $.getJSON('teams.json', callback);
}

function loadStats(callback) {
    // to be fully implemented
    $.getJSON('stats.json', callback);
}
