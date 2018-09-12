const express = require('express');
const app = express();
var request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const PORT = process.env.PORT || 5000;

app.get('/stats', function (req, res) {
    request('http://stats.washingtonpost.com/fb/standings.asp', function (err, resp, body) {
        const { document } = (new JSDOM(body)).window;
        var r = Array.from(document.getElementsByClassName('shsRow0Row'));
        r = r.concat(Array.from(document.getElementsByClassName('shsRow1Row')));
        var stats = {};
        for (var i = 0; i<r.length; i++) {
            name = r[i].children[0].children[0].textContent;
            wins = parseInt(r[i].children[1].textContent);
            stats[name] = wins;
        }
    res.jsonp(stats);
    });
});

app.use(express.static('public'));

app.listen(PORT, () => console.log('Stats app listening on port ${ PORT }!'));
