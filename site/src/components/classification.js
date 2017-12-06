import React from 'react';
import crossfilter from 'crossfilter';
import dc from 'dc';
var d3 = require('d3');
var queue = require('d3-queue');

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

function setup() {
    var colorBarchart = ["#1E2226"];
    var sizeIconChampion = 64;
    var gapWinRate = 50;
    var winPopByName = d3.map();
    queue()
        .defer(d3.json, process.env.PUBLIC_URL + "./data/champions.json", function (d) { winPopByName.set(d.name, [+d.winrate, +d.popularity]); })
    var dataTable = dc.dataTable('#dc-table-graph');
    d3.json(process.env.PUBLIC_URL + "./data/champions.json", function (error, data) {

        var facts = crossfilter(data);
        var championDim = facts.dimension(function (d) {
            return d.name;
        });

        dataTable.width(960)
            .height(800)
            .dimension(championDim)
            .group(function(d){return "Stats";})
            .columns([
                function (d) {return d.name;},
                function (d) {return d.winrate+"%";},
                function (d) {return d.popularity+"%";},
                function (d) {return d.banishment+"%";},
            ])
            .sortBy(function (d) {return d.winrate;})
            .order(d3.ascending)
            .size(10);
        dataTable.render();
    });
    
    
}

export default Classification;
