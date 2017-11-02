import re
import json
import requests

from api_key import API_KEY

def get_summoner_id(name):
	regex = '^[A-Za-z0-9 ]+$'
	if not re.match(regex, name):
		return None

	url = 'https://br1.api.riotgames.com/lol/summoner/v3/summoners/by-name/{}'.format(name)
	url += '?api_key=' + API_KEY
	lol_response = requests.get(url)

	return json.loads(lol_response.text)['id']