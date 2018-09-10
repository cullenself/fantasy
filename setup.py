#!/usr/bin/env python3
import yaml
import update

def getParts():
    parts = []
    for i in range(0,8):
        parts.append(input('Player Name: '))
    return parts

def getPros():
    stats = update.loadWins()
    return list(stats.keys())

def prompt(teamName, parts):
    for i in range(0,len(parts)):
        print(parts[i] + ': ' + str(i+1))
    i = int(input(teamName + ': ')) - 1
    return parts[i]

def main():
    pros = getPros()
    parts = getParts()
    teams = {}
    for part in parts:
        teams[part] = []
    for pro in pros:
        teams[prompt(pro,parts)].append(pro)
    with open('teams.yaml','w') as fp:
        yaml.dump(teams,fp)
    return

if __name__ == '__main__':
    main()
