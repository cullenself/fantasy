#!/usr/bin/env python3
from lxml import html
import requests

def load():
    page = requests.get('http://stats.washingtonpost.com/fb/standings.asp') # easiest site to parse
    tree = html.fromstring(page.content)
    teams = tree.xpath('//tr[@class="shsRow0Row"]')
    teams += tree.xpath('//tr[@class="shsRow1Row"]')
    
    stats = {}
    for t in teams:
        teamName = t[0][0].text_content()
        wins = int(t[1].text_content())
        stats[teamName] = wins

    if len(stats) != 32:
        print('parsing failed') # make into better error

    return stats

if __name__ == '__main__':
    print(load())
