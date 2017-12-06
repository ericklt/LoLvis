import os
import os.path
from flask import Flask, render_template, request
from flask_assets import Bundle, Environment
import json
from json2table import convert

from pprint import pprint

from queries import *

app = Flask(__name__)

assets = Environment(app)

app.config["REQUIREJS_BIN"] = os.path.dirname(__file__) + "/../node_modules/requirejs/bin/r.js"
app.config["REQUIREJS_CONFIG"] = "build.js"
app.config["REQUIREJS_RUN_IN_DEBUG"] = False

debug = True

def json_to_html(json):
	json_object = {'table': json}
	build_direction = "LEFT_TO_RIGHT"
	table_attributes = {"style" : "width:100%"}
	html = convert(json_object, build_direction=build_direction, table_attributes=table_attributes)
	return html;

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

@app.route('/champ_stats')
def getChampStats():
	return json.dumps(get_champ_stats());

M_ID = 1243394779
@app.route('/matches/deaths')
def get_deaths():
	return json.dumps(get_deaths_in_gold())

if __name__ == '__main__':
	os.environ['FLASK_DEBUG'] = '1'
	app.debug = debug
	app.config["ASSETS_DEBUG"] = debug
	app.run()
