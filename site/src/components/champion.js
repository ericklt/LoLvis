import React from 'react';
import dc from 'dc';
import $ from 'jquery'

var d3 = require('d3');

class Champion extends React.Component {

  componentDidMount() {
    let name = this.props.match.params.name;
    d3.json("../static/data/champ_stats.json", function (error, data) {
      let champ = data.filter(d => d.name === name);
      let sorted_champ = champ.sort((d1, d2) => d1.playRate < d2.playRate);
      $('#winrate-text').text((sorted_champ[0].winRate*100).toFixed(1) + '%');
      $('#pickrate-text').text((sorted_champ[0].playRate*100).toFixed(1) + '%');
      $('#banrate-text').text((sorted_champ[0].banRate*100).toFixed(1) + '%');
      $('#lane1-text').text(sorted_champ[0].role);
      if (sorted_champ.length > 1)
        $('#lane2-text').text(sorted_champ[1].role);
    });
  }

  render() {
      let name = this.props.match.params.name;
      return (
          <div className="container champs-container">
              <div className="champ-title page-titles">
                  <h1>{name}</h1>
              </div>
              <div className="champs">
                  <div className="col-md-3 col-sm-3">
                      <img src={"../static/images/Champions_Icons/" + name + "Square.png"} alt="champ_img" />
                  </div>
                  <div className="col-md-9 col-sm-9">
                      <div>
                          <h4 id='lanes-champion'>Lanes: </h4>
                          <h1 id='lane1-text'/>
                          <h5 id='lane2-text'/>
                      </div>
                  </div>
                  <div className="col-md-12 col-sm-12">
                      <div className="col-md-4 col-sm-4">
                          <h4>win rate: </h4>
                          <h2 id='winrate-text'/>
                      </div>
                      <div className="col-md-4 col-sm-4">
                          <h4>pick rate: </h4>
                          <h2 id='pickrate-text'/>
                      </div>
                      <div className="col-md-4 col-sm-4">
                          <h4>ban rate: </h4>
                          <h2 id='banrate-text'/>
                      </div>
                  </div>
              </div>
          </div>
      );
  }
}

export default Champion;
