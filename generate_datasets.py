import requests
import json
import os.path
from riotwatcher import RiotWatcher
import py_gg
from api_key import API_KEY, GG_KEY

watcher = RiotWatcher(API_KEY)
py_gg.init(GG_KEY)
my_region = 'br1'

def generate_gold_players():
	with open('static/data/leagues.json') as leagues:
		leagues_json = json.load(leagues)
		league_id = leagues_json['GOLD']
		print('Getting League Entries')
		entries = json.loads(requests.get('https://{0}.api.riotgames.com/lol/league/v3/leagues/{1}?api_key={2}'.format(my_region, league_id, API_KEY)).text)['entries']
		print('Getting player ids')
		player_ids = [entry['playerOrTeamId'] for entry in entries]
		print('Getting accounts')
		accounts = []
		for i in range(len(player_ids)):
			print('Fetching player: {}/{}'.format(i+1, len(player_ids)), end='\r')
			accounts.append(watcher.summoner.by_id(my_region, player_ids[i]))
		print('\n')
		with open('static/data/accounts.json', 'w') as f:
			json.dump(accounts, f, indent='\t')

# generate_gold_players()

def generate_gold_ranqued_matches():
	with open('static/data/accounts.json') as accounts_file:
		accounts = json.load(accounts_file)
		print('Getting account ids')
		account_ids = [account['accountId'] for account in accounts]
		print('Getting matches')
		matches = []
		for i in range(len(account_ids)):
			print('Fetching matches from player: {}/{}'.format(i+1, len(account_ids)), end='\r')
			matches += watcher.match.matchlist_by_account(my_region, account_ids[i], queue=420)['matches']
		print('\n')
		with open('static/data/matches.json', 'w') as f:
			json.dump(matches, f, indent='\t')

# generate_gold_ranqued_matches()

def get_roles_in_match(match_id):
	match = watcher.match.by_id(my_region, match_id)
	player_roles = {
		participant['participantId']: (participant['timeline']['lane'] if participant['timeline']['lane'] != 'BOTTOM' else participant['timeline']['role'])
		for participant in match['participants']
	}
	player_roles[0] = 'NONE'
	return player_roles

def generate_matches_deaths():
	kill_events = {}

	if os.path.isfile('static/data/kill_events.json'):
		with open('static/data/kill_events.json') as deaths_file:
			kill_events = json.load(deaths_file)

	with open('static/data/matches.json') as matches_file:
		matches  = json.load(matches_file)
		print('Getting match ids')
		match_ids = [match['gameId'] for match in matches]
		roles = {}
		print('Getting death events')
		for i in range(len(match_ids)):
			print('Fetching deaths from match: {}/{}'.format(i+1, len(match_ids)), end='\r')
			if match_ids[i] not in kill_events:
				roles = get_roles_in_match(match_ids[i])
				timeline = watcher.match.timeline_by_match(my_region, match_ids[i])
				kill_events[match_ids[i]] = [event for frame in timeline['frames'] for event in frame['events'] if event['type'] == 'CHAMPION_KILL']
				for event in kill_events[match_ids[i]]:
					event['killerRole'] = roles[event['killerId']]
					event['victimRole'] = roles[event['victimId']]
					event['victimTeam'] = 'blue' if event['victimId'] <= 5 else 'red'
			if i % 100 == 0:
				backup_deaths(kill_events)
		print('\n')
		backup_deaths(kill_events)

def backup_deaths(kill_events):
	cleaned = {}
	for match_id in kill_events:
		cleaned[match_id] = [
								{ key: event[key] for key in ('killerRole', 'victimRole', 'timestamp', 'position', 'victimTeam')}
							for event in kill_events[match_id]]

	with open('static/data/kill_events.json', 'w') as f:
		json.dump(cleaned, f, indent='\t')

# generate_matches_deaths()

base_data = {}

def get_champions_dict():
	lol_response_data = watcher.static_data.champions(my_region)['data']
	d = {int(lol_response_data[key]['id']):lol_response_data[key] for key in lol_response_data}
	return d

def get_champId_to_name_dict():
	if 'champId_to_name' not in base_data:
		champions_dict = get_champions_dict()
		base_data['champId_to_name'] = {_id : champions_dict[_id]['name'] for _id in champions_dict}
	return base_data['champId_to_name']

def generate_champ_stats():
	champ_stats = py_gg.champions.all()
	champ_name_dict = get_champId_to_name_dict()
	for entry in champ_stats:
		entry['name'] = '_'.join(champ_name_dict[entry['championId']].split(' '))
		del entry['_id']

	with open('static/data/champ_stats.json', 'w') as f:
		json.dump(champ_stats, f, indent='\t')

generate_champ_stats()
