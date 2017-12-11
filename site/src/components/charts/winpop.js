import React from 'react';
import crossfilter from 'crossfilter';
import dc from 'dc';
var d3 = require('d3');

class Winpop extends React.Component {
    componentDidMount() {
        setup();
    }
    render() {
        return (
            <div>
                <h3> Popularity By Win Rate</h3>
                <div id="win-pop-scater"></div>
                <div id="tooltip" className="hidden">
                    <p><b /><span id="name-scatter"></span></p>
                    <p>Win Rate: <span id="win-info-scatter"></span></p>
                    <p>Popular.: <span id="pop-info-scatter"></span></p>
                </div>
            </div>
        );
    }
}

function filterData(data) {
  let newData = {}
  for (let i in data) {
    let name = data[i].name;
    if (!(name in newData) || data[i].percentRolePlayed > newData[name].percentRolePlayed)
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

    var winPopScaterPlot = dc.scatterPlot("#win-pop-scater");
    d3.json("static/data/champ_stats.json", function (error, data) {

        data.forEach(function(d) {
            d.win = d.winRate*100;
            d.pop = d.playRate*100;
        });

        data = filterData(data);
        data.sort((d1, d2) => d2.win - d1.win);
        let data1 = data.slice(0, 5);
        data.sort((d1, d2) => d2.pop - d1.pop);
        let data2 = data.slice(0, 5);
        data = data1.concat(data2);
        //criando um crossfilter
        var facts = crossfilter(data);
        var championDim = facts.dimension(d => d.name);

        var winDim = facts.dimension(d => d.win);
        var winMin = winDim.bottom(1)[0].win;
        var winMax = winDim.top(1)[0].win;

        var popDim = facts.dimension(d => d.pop);
        var popMin = popDim.bottom(1)[0].pop;
        var popMax = popDim.top(1)[0].pop;

        var dimScaterplot = facts.dimension(d => [d.pop, d.win, d.name]);
        //var groupScaterplot = dimScaterplot.group();
        var groupScaterplot = dimScaterplot.group().reduce(
            function(v,d){
                v.pop = d.pop;
                v.win = d.win;
                return v;
            },
            function(v,d){
                v.pop = 0;
                v.win = 0;
                return v;
            },
            function(v,d){
                return {pop:0,win:0};
            }
        );
        var border = 2;
        winPopScaterPlot.width(700)
            .height(700)
            .margins({ top: 50, right: 50, bottom: 50, left: 50 })
            .y(d3.scale.linear().domain([winMin - border, winMax + border]))
            .x(d3.scale.linear().domain([popMin - border, popMax + border*2]))
            .yAxisLabel("Win Rate")
            .xAxisLabel("Popularity")
            .brushOn(false)
            .clipPadding(10)
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .dimension(dimScaterplot)
            .excludedOpacity(0.5)
            .group(groupScaterplot)
            .keyAccessor(function (p) {
                return p.value.pop;
            })
            .valueAccessor(function (p) {
                return p.value.win;
            })
            .symbolSize(8)
            .on('renderlet', setDotsIconScatter);
        winPopScaterPlot.render();
    });

    function setDotsIconScatter(chart) {
        let sizeIcon = 64;
        //ON CLICK BAR
        chart.selectAll('path').on("click", function (d) {
            console.log("go to page of champion", );
        });
        let posData = [];
        chart.selectAll('path').each(function (d, i) {
            //console.log(this);
            let trans = d3.select(this).attr('transform') + "";
            if (trans !== "null") {
                //console.log(trans);
                let pos = trans.substr(trans.indexOf("("), trans.indexOf(")")).split(",");
                //console.log(pos);
                posData.push(pos);
            }
        });
        //LABEL AND ICON
        //https://stackoverflow.com/questions/25026010/show-values-on-top-of-bars-in-a-barchart
        let dotsData = [];
        let dots = chart.selectAll('.symbol').each(function (d) { dotsData.push(d); });
        //Remove old values (if found)
        d3.select(dots[0][0].parentNode).select('#inline-labels').remove();
        //Create group for labels
        let gLabels = d3.select(dots[0][0].parentNode).append('g').attr('id', 'inline-labels');
        for (let i = dots[0].length - 1; i >= 0; i--) {
            //var b = dots[0][i];
            //console.log(JSON.stringify(this));
            //ICON IMAGE
            //https://gist.github.com/mygoare/10340316
            gLabels
                .append('svg:image')
                .attr({
                    'id': dotsData[i].key[2],
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
                  console.log(d);
                    let name = d3.select(this).attr('id');
                    let win = d3.select(this).attr('win');;
                    let pop = d3.select(this).attr('pop');
                    var coordinates = [0, 0];
                    coordinates = d3.mouse(d3.select("body").node()); // obtém a posição do mouse relativa a this
                    var x = coordinates[0];
                    var y = coordinates[1];
                    showTooltip(name, win, pop, x, y);
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .style("cursor", "default")
                        .attr("stroke-width", 0)
                        .attr("stroke", "none"); //volta ao valor padrão
                    hideTooltip();
                });
        }
    }
    function showTooltip(name, win, pop, x, y) {
        d3.select("#tooltip")
            .style("left", x + "px")
            .style("top", y + "px");
        d3.select("#tooltip")
            .select("#win-info-scatter")
            .text(Number(win).toFixed(1)+"%");
        d3.select("#tooltip")
            .select("#pop-info-scatter")
            .text(Number(pop).toFixed(1)+"%");
        d3.select("#tooltip")
            .select("#name-scatter")
            .text(name+"");
        d3.select("#tooltip")
            .classed("hidden", false);
    }
    function hideTooltip() {
        d3.select("#tooltip")
            .classed("hidden", true);
    }
}

export default Winpop;
