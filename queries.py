import re

import py_gg
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
	return py_gg.champions.all()

def get_champ_winrates():
	all_champ = get_champ_stats()
	champ_name_dict = get_champId_to_name_dict()
	return [{
			'name': champ_name_dict[entry['_id']['championId']], 
			'role': entry['_id']['role'],
			'winrate': entry['winRate']
			} for entry in all_champ]

def get_roles_in_match(match_id):
	match = watcher.match.by_id(my_region, match_id)
	player_roles = {
		participant['participantId']: (participant['timeline']['lane'] if participant['timeline']['lane'] != 'BOTTOM' else participant['timeline']['role']) 
		for participant in match['participants']
	}
	return player_roles
	
def get_jungle_deaths_in_match(match_id):
	player_roles = get_roles_in_match(match_id)
	junglers = [x for x in player_roles if player_roles[x] == 'JUNGLE']
	timeline = watcher.match.timeline_by_match(my_region, match_id)
	kill_events = [event for frame in timeline['frames'] for event in frame['events'] if event['type'] == 'CHAMPION_KILL']
	jungle_kills = filter(lambda kill: kill['victimId'] in junglers, kill_events)

	return [{
		'timestamp': kill['timestamp'],
		'position': kill['position'],
		'team': ('red' if kill['victimId'] <= 5 else 'blue')
	} for kill in jungle_kills]

