import React from 'react';
import crossfilter from 'crossfilter';
import dc from 'dc';
var d3 = require('d3');

class Winrate extends React.Component {
    componentDidMount() {
        setup();
    }
    render() {
        return(
            <div>
                <h4> Champions Win Rate Rank</h4>
                <div id="winRate-chart"></div>
            </div>
        );
    }
}

function filterData(data) {
  let newData = {}
  data.forEach(function(d) {
      if (!(d.name in newData) || d.playRate > newData[d.name].playRate)
          newData[d.name] = d;
  });
  let data_list = []
  for (let key in newData) {
    data_list.push(newData[key]);
  }
  return data_list;
}

function setup() {
    var colorBarchart = ["#1E2226"];
    var sizeIconChampion = 64;
    var gapWinRate = 20;

    var winRateChart = dc.barChart('#winRate-chart');
    d3.json("static/data/champ_stats.json", function (error, data) {

        data.forEach(d => d.win = d.winRate*100);

        data = filterData(data);

        data.sort((d1, d2) => d2.win - d1.win)
        data = data.slice(0, 10);

        //criando um crossfilter
        var facts = crossfilter(data);
        var championDim = facts.dimension(d => d.name);
        var winRateGroup = championDim.group().reduceSum(d => d.win)
        var top10 = winRateGroup.orderNatural().top(10);
        var top10Names = top10.map(d => d.key);
        //WIN RATE
        winRateChart
            .width(800)
            .height(400)
            .margins({ top: 50, right: 50, bottom: 50, left: 50 })
            .dimension(championDim)
            .group(winRateGroup)
            .xUnits(dc.units.ordinal)
            .x(d3.scale.ordinal().domain(top10Names))
            .y(d3.scale.linear().domain([0, 100]))
            .xAxisLabel("Champions")
            .yAxisLabel("Win Rate (%)")
            .renderHorizontalGridLines(true)
            .brushOn(false)
            .gap(gapWinRate)
            .ordinalColors(colorBarchart)
            .on('renderlet', setLabelsIcons);
        winRateChart.render();
    });
    function setLabelsIcons(chart) {
        //ON CLICK BAR
        chart.selectAll('rect').on("click", function (d) {
            console.log("go to page of champion", d);
        });
        //LABEL AND ICON
        var barsData = [];
        var bars = chart.selectAll('.bar').each(function (d) { barsData.push(d); });
        //Remove old values (if found)
        d3.select(bars[0][0].parentNode).select('#inline-labels').remove();
        //Create group for labels
        var gLabels = d3.select(bars[0][0].parentNode).append('g').attr('id', 'inline-labels');
        for (var i = bars[0].length - 1; i >= 0; i--) {
            var b = bars[0][i];
            gLabels
                .append('svg:image')
                .attr({
                    'xlink:href': 'static/images/Champions_Icons/' + barsData[i].data.key + 'Square.png',
                    x: 0,
                    y: 0,
                    width: sizeIconChampion,
                    height: sizeIconChampion
                })
                .attr('x', +b.getAttribute('x') + (b.getAttribute('width') / 2) - sizeIconChampion / 2)
                .attr('y', +b.getAttribute('y') - sizeIconChampion - 16)
                .attr('text-anchor', 'middle')
                .attr('fill', 'red')
                .on('click', function (d) {
                    d3.select(b).on('click')();
                });
            //Only create label if bar height is tall enough
            if (+b.getAttribute('height') < 18) continue;
            //TEXT LABEL
            gLabels
                .append("text")
                .text(Number(barsData[i].data.value).toFixed(1) + "%")
                .attr('x', +b.getAttribute('x') + (b.getAttribute('width') / 2))
                .attr('y', +b.getAttribute('y') + 24)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white');
        }
    }

}

export default Winrate;
