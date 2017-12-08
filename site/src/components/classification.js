import React from 'react';
import crossfilter from 'crossfilter';
import dc from 'dc';
var d3 = require('d3');

class Classification extends React.Component {
    componentDidMount() {
        setup();
    }
    render() {
        const name = this.props.match.params.name
        return (
            <div className="container champs-container champ-title">
                <h4> General Table</h4>
                <table class="table table-hover" id="dc-table-graph">
                    <thead>
                        <tr class="header">
                            <th>Champion</th>
                            <th>Win Rate</th>
                            <th>Popularity</th>
                            <th>Banishment</th>
                        </tr>
                    </thead>
                </table>
            </div>
        );
    }
}

function filterData(data) {
  let newData = {}
  for (let i in data) {
    let name = data[i].name;
    if (!(name in newData) || data[i].playRate > newData[name].playRate)
        newData[name] = data[i];
  }
  let data_list = []
  for (let key in newData) {
    data_list.push(newData[key]);
  }
  return data_list;
}

function setup() {
    var colorBarchart = ["#1E2226"];
    var sizeIconChampion = 64;
    var gapWinRate = 50;
    var dataTable = dc.dataTable('#dc-table-graph');

    d3.json("static/data/champ_stats.json", function (error, data) {

        data.forEach(d => {
            d.win = d.winRate*100;
            d.pop = d.playRate*100;
            d.ban = d.banRate*100;
        });

        var facts = crossfilter(data);
        var championDim = facts.dimension(d => [d.name, d.role]);

        dataTable.width(960)
            .height(800)
            .dimension(championDim)
            .group(d => "Stats")
            .columns([
                d => d.name,
                d => d.win.toFixed(1)+"%",
                d => d.pop.toFixed(1)+"%",
                d => d.ban.toFixed(1)+"%",
            ])
            .sortBy(d => d.win)
            .order(d3.descending);
        dataTable.render();
    });


}

export default Classification;
