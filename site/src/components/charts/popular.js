import React from 'react';
import crossfilter from 'crossfilter';
import dc from 'dc';
var d3 = require('d3');

class Popular extends React.Component {
    componentDidMount() {
        setup();
    }
    render() {
        return (
            <div>
                <h4> Champions Popularity Rank</h4>
                <div id="popular-chart"></div>
            </div>
        );
    }
}

function filterData(data) {
  let newData = {}
  for (let i in data) {
    let name = data[i].name;
    if (!(name in newData) || +data[i].playRate > +newData[name].playRate)
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
    var gapWinRate = 20;
    var popularChart = dc.barChart('#popular-chart');
    d3.json("static/data/champ_stats.json", function (error, data) {

        data.forEach(d => d.pop = d.playRate*100);

        data = filterData(data);
        data.sort((d1, d2) => d2.pop - d1.pop);
        data = data.slice(0, 10);
        //criando um crossfilter
        var facts = crossfilter(data);
        var championDim = facts.dimension(d => d.name);
        //var popularGroup = championDim.group().reduceSum(d => d.pop);
        var popularGroup = championDim.group().reduce(
            function(v,d){
                v.amount = (v.amount*v.count + d.pop)/(v.count+1);
                v.count++;
                return v;
            },
            function(v,d){
                v.amount = (v.amount*v.count - d.pop)/(v.count-1);
                v.count--;
                return v;
            },
            function(v,d){
                return {amount:0,count:0};
            }
        );
        var top10 = popularGroup.order(d=> d.amount).top(10);
        var top10Names = top10.map(d => d.key);
        //POPULARITY
        popularChart
            .width(800)
            .height(400)
            .margins({ top: 50, right: 50, bottom: 50, left: 50 })
            .dimension(championDim)
            .group(popularGroup)
            .xUnits(dc.units.ordinal)
            .x(d3.scale.ordinal().domain(top10Names))
            .y(d3.scale.linear().domain([0, 40]))
            .xAxisLabel("Champions")
            .yAxisLabel("Popularity (%)")
            .renderHorizontalGridLines(true)
            //.brushOn(false)
            .valueAccessor(function (p) {
                return p.value.amount;
            })
            .ordering(function(d) { return d.pop; })
            .gap(gapWinRate)
            .ordinalColors(colorBarchart)
            .on('renderlet', setLabelsIcons);
        popularChart.render();
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
                .text(Number(barsData[i].data.value.amount).toFixed(1) + "%")
                .attr('x', +b.getAttribute('x') + (b.getAttribute('width') / 2))
                .attr('y', +b.getAttribute('y') + 24)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white');
        }
    }

}

export default Popular;
