import React from 'react';
var dc = require("dc")
var crossfilter = require("crossfilter")
var d3 = require("d3");



class General extends React.Component {

  render() {
    return (
      <div>
        <h4> Champions Win Rate Rank</h4>
        <div id="winrate-chart"></div>
        <h4> Champions Popularity Rank</h4>
        <div id="popular-chart"></div>
        <h4> Popularity Vayne by time</h4>
        <div id="time-chart"></div>
    </div>
      );
    }
}

//PARAMETERS
       var colorBarchart = ["#1E2226"];
       var sizeIconChampion = 64;
       var gapWinRate = 50;
       //var winRateByName = d3.map();
       // queue()
       //     .defer(d3.json, "champions.json", function(d) { winRateByName.set(d.name, d.winrate); })
       var winRateChart = dc.barChart('#winrate-chart');
       var popularChart = dc.barChart('#popular-chart');
       var timeChart = dc.lineChart('#time-chart');
       d3.json("/src/components/champions.json", function(error, data){
           //criando um crossfilter
           data = [
           	{
           		"name": "Vayne",
           		"winrate": 49.6,
           		"popularity": 30.1
           	},
           	{
           		"name": "Ezreal",
           		"winrate": 54.2,
           		"popularity": 28.3
           	},
           	{
           		"name": "Lee Sin",
           		"winrate": 48.3,
           		"popularity": 23.7
           	},
           	{
           		"name": "Miss Fortune",
           		"winrate": 52.0,
           		"popularity": 23.0
           	},
           	{
           		"name": "Jhin",
           		"winrate": 48.4,
           		"popularity": 22.0
           	}
           ]

           var facts = crossfilter(data);
           var championDim = facts.dimension(function(d){
               return d.name;
           });
           var winRateGroup = championDim.group().reduceSum(function(d){
               return d.winrate;
           });
           var sortChampions= data.sort(function (a, b) { return a.winrate < b.winrate; });
           var champions = sortChampions.map(function (d) { return d.name; });
           //WIN RATE
           winRateChart
               .width(800)
               .height(400)
               .margins({top: 50, right: 50, bottom: 50, left: 50})
               .dimension(championDim)
               .y(d3.scaleLinear().domain([0, 100]))
               .xUnits(dc.units.ordinal)
               .x(d3.scaleOrdinal().domain(champions))
               .xAxisLabel("Champions")
               .yAxisLabel("Win Rate (%)")
               .renderHorizontalGridLines(true)
               .brushOn(false)
               .group(winRateGroup)
               .ordering(function(d) { return d.winrate; })
               .gap(gapWinRate)
               .ordinalColors(colorBarchart)
               .on('renderlet', setLabelsIcons);
           winRateChart.render();
           var popularGroup = championDim.group().reduceSum(function(d){
               return d.popularity;
           });
           var sortChampions= data.sort(function (a, b) { return a.popularity < b.popularity; });
           var champions = sortChampions.map(function (d) { return d.name; });
           //POPULARITY
           popularChart
               .width(800)
               .height(400)
               .margins({top: 50, right: 50, bottom: 50, left: 50})
               .dimension(championDim)
               .y(d3.scaleLinear().domain([0, 100]))
               .xUnits(dc.units.ordinal)
               .x(d3.scaleOrdinal().domain(champions))
               .xAxisLabel("Champions")
               .yAxisLabel("Popularity (%)")
               .renderHorizontalGridLines(true)
               .brushOn(false)
               .group(popularGroup)
               .ordering(function(d) { return d.winrate; })
               .gap(gapWinRate)
               .ordinalColors(colorBarchart)
               .on('renderlet', setLabelsIcons);
           popularChart.render();
       });
       function setLabelsIcons(chart){
           //ON CLICK BAR
           chart.selectAll('rect').on("click", function(d) {
                   console.log("go to page of champion", d);
               });
           //LABEL AND ICON
           //https://stackoverflow.com/questions/25026010/show-values-on-top-of-bars-in-a-barchart
           var barsData = [];
           var bars = chart.selectAll('.bar').each(function(d) { barsData.push(d); });
           //Remove old values (if found)
           d3.select(bars[0][0].parentNode).select('#inline-labels').remove();
           //Create group for labels
           var gLabels = d3.select(bars[0][0].parentNode).append('g').attr('id','inline-labels');
           for (var i = bars[0].length - 1; i >= 0; i--) {
               var b = bars[0][i];
               //ICON IMAGE
               //https://gist.github.com/mygoare/10340316
               gLabels
                   .append('svg:image')
                   .attr({
                     'xlink:href': 'icons_champions/'+barsData[i].data.key+'.png',
                     x: 0,
                     y: 0,
                     width: sizeIconChampion,
                     height: sizeIconChampion
                   })
                   .attr('x', +b.getAttribute('x') + (b.getAttribute('width')/2) - sizeIconChampion/2 )
                   .attr('y', +b.getAttribute('y') - sizeIconChampion - 16 )
                   .attr('text-anchor', 'middle')
                   .attr('fill', 'red')
                   .on('click',function(d){
                       //console.log(JSON.stringify(d));
                       //action click -> go to page
                       d3.select(b).on('click')();
                   });
               //Only create label if bar height is tall enough
               if (+b.getAttribute('height') < 18) continue;
               //TEXT LABEL
               gLabels
                   .append("text")
                   .text(Number(barsData[i].data.value).toFixed(1)+"%")
                   .attr('x', +b.getAttribute('x') + (b.getAttribute('width')/2) )
                   .attr('y', +b.getAttribute('y') + 24 )
                   .attr('text-anchor', 'middle')
                   .attr('fill', 'white');
           }
       }
       function setLabelsTime(chart){
           //LABEL AND ICON
           //https://stackoverflow.com/questions/25026010/show-values-on-top-of-bars-in-a-barchart
           var dotsData = [];
           var dots = chart.selectAll('.dot').each(function(d) { dotsData.push(d); });
           //Remove old values (if found)
           d3.select(dots[0][0].parentNode).select('#inline-labels').remove();
           //Create group for labels
           var gLabels = d3.select(dots[0][0].parentNode).append('g').attr('id','inline-labels');
           for (var i = dots[0].length - 1; i >= 0; i--) {
               var b = dots[0][i];
               //console.log(JSON.stringify(b));
               //console.log(dotsData[i].x+" "+dotsData[i].y);
               //TEXT LABEL
               gLabels
                   .append("text")
                   .text(Number(dotsData[i].data.value).toFixed(1)+"%")
                   .attr('x', +dotsData[i].x)
                   .attr('y', +dotsData[i].y)
                   .attr('text-anchor', 'middle')
                   .attr('fill', colorBarchart);
           }
       }

export default General;
