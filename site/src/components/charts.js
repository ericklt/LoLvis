import React from 'react';
import crossfilter from 'crossfilter';
import dc from 'dc';
var d3 = require('d3');
var queue = require('d3-queue');

class Charts extends React.Component {
    componentDidMount() {
        setup();
    }
    render() {
        return (
            <div className="container champs-container">
                <div className="champs">
                    <h4> Champions Win Rate Rank</h4>
                    <div id="winRate-chart"></div>
                    <h4> Champions Popularity Rank</h4>
                    <div id="popular-chart"></div>
                    <h4> Popularity By Win Rate</h4>
                    <div id="win-pop-scater"></div>
                    <div id="tooltip" className="hidden">
                        <p><b /><span id="name-scatter"></span></p>
                        <p>Win Rate: <span id="win-info-scatter"></span></p>
                        <p>Popular.: <span id="pop-info-scatter"></span></p>
                    </div>

                </div>
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
  for (let key in newData)
    data_list.push(newData[key]);
  return data_list;
}

function setup() {
    var colorBarchart = ["#1E2226"];
    var sizeIconChampion = 64;
    var gapWinRate = 20;

    var winRateChart = dc.rowChart('#winRate-chart');
    var popularChart = dc.rowChart('#popular-chart');
    var winPopScaterPlot = dc.scatterPlot("#win-pop-scater");

    d3.json("static/data/champ_stats.json", function (error, data) {

        data = filterData(data);

        data.forEach(function(d) {
            d.win = (d.winRate * 100).toFixed(1);
            d.pop = (d.playRate * 100).toFixed(1);
            d.ban = (d.banRate * 100).toFixed(1);
        });

        //criando um crossfilter
        let facts = crossfilter(data);
        let championDim = facts.dimension(d => d.name);

        //WIN RATE
        let winRateGroup = championDim.group();

        winRateChart
            .width(800)
            .height(400)
            .margins({ top: 50, right: 50, bottom: 50, left: 50 })
            .dimension(championDim)
            .group(winRateGroup)
            // .x(d3.scale.ordinal())
            // .xUnits(dc.units.ordinal)
            // .xAxisLabel("Champions")
            // .yAxisLabel("Win Rate (%)")
            // .renderHorizontalGridLines(true)
            // .brushOn(false)
            // .gap(gapWinRate)
            // .elasticY(true)
            // .ordinalColors(colorBarchart)
            .ordering(d => -d.win)
            .on('renderlet', setLabelsIcons);

        winRateChart.data(group => group.top(10));

        //POPULARITY
        let popularGroup = championDim.group();
        popularChart
            .width(800)
            .height(400)
            .margins({ top: 50, right: 50, bottom: 50, left: 50 })
            .dimension(championDim)
            .group(popularGroup)
            // .x(d3.scale.ordinal())
            // .xUnits(dc.units.ordinal)
            // .xAxisLabel("Champions")
            // .yAxisLabel("Popularity (%)")
            // .renderHorizontalGridLines(true)
            // .brushOn(false)
            // .elasticY(true)
            // .gap(gapWinRate)
            // .ordinalColors(colorBarchart)
            .ordering(d => -d.pop)
            .on('renderlet', setLabelsIcons);

        popularChart.data(group => group.top(10));

        let winDim = facts.dimension(d => d.win);

        var winMin = winDim.bottom(1)[0].win;
        var winMax = winDim.top(1)[0].win;

        var popDim = facts.dimension(d => d.pop);

        var popMin = popDim.bottom(1)[0].pop;
        var popMax = popDim.top(1)[0].pop;
        //console.log(winMin+","+winMax+","+popMin+","+popMax);
        let dimScaterplot = facts.dimension(d => [d.pop, d.win, d.name]);
        var groupScaterplot = dimScaterplot.group();
        var border = 2;
        winPopScaterPlot.width(700)
            .height(700)
            .margins({ top: 50, right: 50, bottom: 50, left: 50 })
            .y(d3.scale.linear().domain([winMin - border, winMax + border]))
            .x(d3.scale.linear().domain([popMin - border, popMax + border]))
            .yAxisLabel("Win Rate")
            .xAxisLabel("Popularity")
            .brushOn(false)
            .clipPadding(10)
            .dimension(dimScaterplot)
            .excludedOpacity(0.5)
            .group(groupScaterplot)
            .symbolSize(8)
            .on('renderlet', setDotsIconScatter);

        dc.renderAll();
    });
    function setLabelsIcons(chart) {
        //ON CLICK BAR
        chart.selectAll('rect').on("click", d => console.log("go to page of champion", d));
        //LABEL AND ICON
        //https://stackoverflow.com/questions/25026010/show-values-on-top-of-bars-in-a-barchart
        var barsData = [];
        var bars = chart.selectAll('.bar').each(d => barsData.push(d));
        //Remove old values (if found)
        d3.select(bars[0][0].parentNode).select('#inline-labels').remove();
        //Create group for labels
        var gLabels = d3.select(bars[0][0].parentNode).append('g').attr('id', 'inline-labels');
        for (var i = bars[0].length - 1; i >= 0; i--) {
            var b = bars[0][i];
            //ICON IMAGE
            //https://gist.github.com/mygoare/10340316
            gLabels
                .append('svg:image')
                .attr({
                    'xlink:href': 'static/images/Champions_Icons/' + barsData[i].key[2] + 'Square.png',
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
                    //console.log(JSON.stringify(d));
                    //action click -> go to page
                    d3.select(b).on('click')();
                });
            //Only create label if bar height is tall enough
            if (+b.getAttribute('height') < 18) continue;
            //TEXT LABEL
            gLabels
                .append("text")
                .text(Number(barsData[i].value).toFixed(1) + "%")
                .attr('x', +b.getAttribute('x') + (b.getAttribute('width') / 2))
                .attr('y', +b.getAttribute('y') + 24)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white');
        }
    }
    function setDotsIconScatter(chart) {
        var sizeIcon = 64;
        //ON CLICK BAR
        chart.selectAll('path').on("click", function (d) {
            console.log("go to page of champion", );
        });
        var posData = [];
        chart.selectAll('path').each(function (d, i) {
            //console.log(this);
            var trans = d3.select(this).attr('transform') + "";
            if (trans !== "null") {
                //console.log(trans);
                var pos = trans.substr(trans.indexOf("("), trans.indexOf(")")).split(",");
                //console.log(pos);
                posData.push(pos);
            }
        });
        //LABEL AND ICON
        //https://stackoverflow.com/questions/25026010/show-values-on-top-of-bars-in-a-barchart
        var dotsData = [];
        var dots = chart.selectAll('.symbol').each(function (d) { dotsData.push(d); });
        //Remove old values (if found)
        d3.select(dots[0][0].parentNode).select('#inline-labels').remove();
        //Create group for labels
        var gLabels = d3.select(dots[0][0].parentNode).append('g').attr('id', 'inline-labels');
        for (var i = dots[0].length - 1; i >= 0; i--) {
            //var b = dots[0][i];
            //console.log(JSON.stringify(this));
            //ICON IMAGE
            //https://gist.github.com/mygoare/10340316
            gLabels
                .append('svg:image')
                .attr({
                    'id': dotsData[i].key[2].name,
                    'win': dotsData[i].key[0],
                    'pop': dotsData[i].key[1],
                    'xlink:href': 'static/images/Champions_Icons/' + dotsData[i].key[2] + 'Square.png',
                    x: 0,
                    y: 0,
                    width: sizeIcon,
                    height: sizeIcon
                })
                .attr('x', +posData[i][0].split("(")[1] - sizeIcon / 2)
                .attr('y', +posData[i][1].split(")")[0] - sizeIcon / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', 'red')
                .on('mouseover', function (d) {
                    var name = d3.select(this).attr('id');
                    var win = d3.select(this).attr('win');;
                    var pop = d3.select(this).attr('pop');
                    var x = d3.select(this).attr('x');
                    var y = d3.select(this).attr('y');
                    showTooltip(name, win, pop, x, y);
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .style("cursor", "default")
                        .attr("stroke-width", 0)
                        .attr("stroke", "none"); //volta ao valor padrão
                    hideTooltip();
                });
            // //Only create label if bar height is tall enough
            // if (+b.getAttribute('height') < 18) continue;
            //TEXT LABEL
            gLabels
                .append("text")
                .text(Number(dotsData[i].key[0]).toFixed(1) + "," + Number(dotsData[i].key[1]).toFixed(1))
                .attr('x', +posData[i][0].split("(")[1])
                .attr('y', +posData[i][1].split(")")[0] + sizeIcon / 2 + 15)
                .attr('text-anchor', 'middle')
                .attr('fill', 'red');
        }
    }
    function showTooltip(name, win, pop, x, y) {
        d3.select("#tooltip")
            .style("left", x + "px")
            .style("top", y + "px")
            .select("#win-info-scatter")
            .text(Number(win).toFixed(1) + "%");
        d3.select("#tooltip")
            .style("left", x + "px")
            .style("top", y + "px")
            .select("#pop-info-scatter")
            .text(Number(pop).toFixed(1) + "%");
        d3.select("#tooltip")
            .select("#name-scatter")
            .text(name + "");
        d3.select("#tooltip")
            .classed("hidden", false);
    }
    function hideTooltip() {
        d3.select("#tooltip")
            .classed("hidden", true);
    }
}

export default Charts;
