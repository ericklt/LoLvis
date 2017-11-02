from flask import Flask, render_template, request

from queries import *

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
	return render_template('index.html')

@app.route('/search/', methods=['GET'])
def getSummonerId():
	name = request.args.get('summoner', None)
	summoner_id = get_summoner_id(name)
	print(summoner_id)
	if not summoner_id: return render_template('index.html'), 400
	return str(summoner_id)

if __name__ == '__main__':
	app.run()