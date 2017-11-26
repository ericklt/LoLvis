import requests
import json
from riotwatcher import RiotWatcher
from api_key import API_KEY, GG_KEY

watcher = RiotWatcher(API_KEY)
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

def generate_matches_deaths():
	with open('static/data/matches.json') as matches_file:
		matches  = json.load(matches_file)
		print('Getting match ids')
		match_ids = [match['gameId'] for match in matches]
		print('Getting death events')
		kill_events = {}
		for i in range(len(match_ids)):
			print('Fetching deaths from match: {}/{}'.format(i+1, len(match_ids)), end='\r')
			timeline = watcher.match.timeline_by_match(my_region, match_ids[i])
			kill_events[match_ids[i]] = [event for frame in timeline['frames'] for event in frame['events'] if event['type'] == 'CHAMPION_KILL']
		print('\n')
		with open('static/data/kill_events.json', 'w') as f:
			json.dump(kill_events, f, indent='\t')

# generate_matches_deaths()