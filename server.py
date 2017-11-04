from flask import Flask, render_template, request
import json
from pprint import pprint

from queries import *

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
	return render_template('index.html')

@app.route('/search/', methods=['GET'])
def getSummonerMasteries():
	name = request.args.get('summoner', None)
	masteries = get_champion_masteries(name)
	if not masteries: return render_template('index.html'), 400
	s = ''.join(['<p>{}</p>'.format(mastery) for mastery in masteries])
	return s

@app.route('/champions')
def getAllChampions():
	return json.dumps(get_champions_dict())

if __name__ == '__main__':
	app.run()