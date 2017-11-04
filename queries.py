import re

from riotwatcher import RiotWatcher
from api_key import API_KEY

watcher = RiotWatcher(API_KEY)
my_region = 'br1'

def get_summoner(name):
	regex = '^[A-Za-z0-9 ]+$'
	if not re.match(regex, name):
		return None
	return watcher.summoner.by_name(my_region, name)

def get_champion_masteries(name):
	summoner = get_summoner(name)
	if summoner:
		champions_dict = get_champions_dict()
		champ_name_dict = {_id : champions_dict[_id]['name'] for _id in champions_dict}
		_id = summoner['id']
		masteries = watcher.champion_mastery.by_summoner(my_region, _id)
		return [{'champion': champ_name_dict[mastery['championId']], 'level':mastery['championLevel']} for mastery in masteries]
	return None

def get_champions_dict():
	lol_response_data = watcher.static_data.champions(my_region)['data']
	d = {int(lol_response_data[key]['id']):lol_response_data[key] for key in lol_response_data}
	return d

