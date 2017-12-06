import re
import json
import py_gg
import requests
import random
from riotwatcher import RiotWatcher
from api_key import API_KEY, GG_KEY

watcher = RiotWatcher(API_KEY)
py_gg.init(GG_KEY)
my_region = 'br1'

base_data = {}

def get_champId_to_name_dict():
	if 'champId_to_name' not in base_data:
		champions_dict = get_champions_dict()
		base_data['champId_to_name'] = {_id : champions_dict[_id]['name'] for _id in champions_dict}
	return base_data['champId_to_name']

def get_summoner(name):
	regex = '^[A-Za-z0-9 ]+$'
	if not re.match(regex, name):
		return None
	return watcher.summoner.by_name(my_region, name)

def get_champion_masteries(name):
	summoner = get_summoner(name)
	if summoner:
		champ_name_dict = get_champId_to_name_dict()
		_id = summoner['id']
		masteries = watcher.champion_mastery.by_summoner(my_region, _id)
		return [{'champion': champ_name_dict[mastery['championId']], 'level':mastery['championLevel']} for mastery in masteries]
	return None

def get_champions_dict():
	lol_response_data = watcher.static_data.champions(my_region)['data']
	d = {int(lol_response_data[key]['id']):lol_response_data[key] for key in lol_response_data}
	return d

def get_champ_stats():
	with open('static/data/champ_stats.json') as f:
		return json.load(f)
	
def get_roles_in_match(match_id):
	match = watcher.match.by_id(my_region, match_id)
	player_roles = {
		participant['participantId']: (participant['timeline']['lane'] if participant['timeline']['lane'] != 'BOTTOM' else participant['timeline']['role'])
		for participant in match['participants']
	}
	return player_roles

def get_deaths_in_gold():
	with open('static/data/kill_events.json') as f:
		matches_kills = json.load(f)
		deaths = []
		for match_id in matches_kills:
			kill_events = matches_kills[match_id]
			# filtered_kills = [x for x in kill_events if x['victimRole'] == 'DUO_CARRY']
			deaths += [{ key: kill[key] for key in ('timestamp', 'position', 'victimTeam', 'victimRole') } for kill in kill_events]
		return deaths
	return None
