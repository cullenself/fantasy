#!/usr/bin/env python3
from lxml import html
from jinja2 import Template
import requests
import yaml

def loadWins():
    page = requests.get('http://stats.washingtonpost.com/fb/standings.asp') # easiest site to parse
    tree = html.fromstring(page.content)
    teams = tree.xpath('//tr[@class="shsRow0Row"]')
    teams += tree.xpath('//tr[@class="shsRow1Row"]')
    
    stats = {}
    for t in teams:
        teamName = str(t[0][0].text_content())
        wins = int(t[1].text_content())
        stats[teamName] = wins

    if len(stats) != 32:
        print('parsing failed') # make into better error

    return stats

def loadTeams():
    with open('teams.yaml', 'r') as fp:
        teams = yaml.load(fp)
    return teams 

def render(score, teams, stats):
    with open('index.html.jinja') as fp:
        tmpl = Template(fp.read())
    # Reformat Score to be template friendly
    score = [{'wins':w,'part':p} for w,p in sorted([(w,p) for p,w in score.items()], reverse=True)]
    with open('index.html','w') as outFile:
        outFile.write(tmpl.render(score=score))
    return

if __name__ == '__main__':
    teams = loadTeams()
    stats = loadWins()
    score = {}
    for part in teams:
        score[part] = 0
        for pro in teams[part]:
            score[part] += stats[pro]
    render(score,teams,stats)
