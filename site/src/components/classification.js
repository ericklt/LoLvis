import React from 'react';
import crossfilter from 'crossfilter';
import dc from 'dc';
import $ from 'jquery';
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
                        <th class="data-table-col" data-col="name">Champion</th>
                        <th class="data-table-col" data-col="role">Role</th>
                        <th class="data-table-col order" data-col="win">Win Rate</th>
                        <th class="data-table-col" data-col="pop">Popularity</th>
                        <th class="data-table-col" data-col="ban">Ban</th>
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

        var sortAscending = false;
        var actualColumn = "winrate";
        dataTable.width(800)
            .height(800)
            .dimension(championDim)
            .group(function(d){return "Stats";})
            .columns([
              function (d) {return d.name;},
              function (d) {return d.role;},
              function (d) {return d.win.toFixed(1)+"%";},
              function (d) {return d.pop.toFixed(1)+"%";},
              function (d) {return d.ban.toFixed(1)+"%";},
              ])
            .sortBy(function (d) {return d.win;})
            .order(d3.descending)
        dataTable.render();

        $('#dc-table-graph').on('click', '.data-table-col', function() {
            var column = $(this).attr("data-col");
            d3.selectAll(".data-table-col").style("background-color","white");
            d3.select(this).style("background-color","#8F918E");
            if(actualColumn===column){
                sortAscending=!sortAscending;
            }else{
                if(column!="name"&&column!="role"){
                    sortAscending=false;
                }else{
                    sortAscending=true;
                }
            }
            actualColumn=column;
            dataTable.sortBy(d=>d[column])
                    .order(sortAscending?d3.ascending:d3.descending);
            dataTable.redraw();
        });
    });


}

export default Classification;
