import React from 'react';
import crossfilter from 'crossfilter';
import dc from 'dc';
var d3 = require('d3');
var queue = require('d3-queue');

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

function setup() {
    var colorBarchart = ["#1E2226"];
    var sizeIconChampion = 64;
    var gapWinRate = 50;
    var winPopByName = d3.map();
    queue()
        .defer(d3.json, process.env.PUBLIC_URL + "./data/champions.json", function (d) { winPopByName.set(d.name, [+d.winrate, +d.popularity]); })
    var popularChart = dc.barChart('#popular-chart');
    d3.json(process.env.PUBLIC_URL + "./data/champions.json", function (error, data) {

        //criando um crossfilter
        var facts = crossfilter(data);
        var championDim = facts.dimension(function (d) {
            return d.name;
        });
        var popularGroup = championDim.group().reduceSum(function (d) {
            return d.popularity;
        });
        var sortChampions = data.sort(function (a, b) { return a.popularity < b.popularity; });
        var champions = sortChampions.map(function (d) { return d.name; });
        //POPULARITY
        popularChart
            .width(800)
            .height(400)
            .margins({ top: 50, right: 50, bottom: 50, left: 50 })
            .dimension(championDim)
            .y(d3.scale.linear().domain([0, 100]))
            .xUnits(dc.units.ordinal)
            .x(d3.scale.ordinal().domain(champions))
            .xAxisLabel("Champions")
            .yAxisLabel("Popularity (%)")
            .renderHorizontalGridLines(true)
            .brushOn(false)
            .group(popularGroup)
            .ordering(function (d) { return d.winrate; })
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
                    'xlink:href': 'icons_champions/' + barsData[i].data.key + '.png',
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

export default Popular;