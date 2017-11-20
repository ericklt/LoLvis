from flask import Flask, render_template, request
import json
from json2table import convert

from pprint import pprint

from queries import *

def json_to_html(json):
	json_object = {'table': json}
	build_direction = "LEFT_TO_RIGHT"
	table_attributes = {"style" : "width:100%"}
	html = convert(json_object, build_direction=build_direction, table_attributes=table_attributes)
	return html;

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

@app.route('/champ_stats/all')
def getChampStats():
	return json.dumps(get_champ_stats());

@app.route('/champ_stats/winrates')
def getChampWinrates():
	return json_to_html(get_champ_winrates())

M_ID = 1243394779
@app.route('/matches/deaths')
def get_jungle_deaths():
	deaths = get_jungle_deaths_in_match(M_ID)
	return json_to_html(deaths)

if __name__ == '__main__':
	app.run()