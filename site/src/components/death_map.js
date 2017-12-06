import React from 'react';
import {Link} from 'react-router-dom';
import './deaths.css';
import $ from 'jquery';

var canvas;
var ctx;

var rawDeaths;
var deaths;
var max;
var maxBlueDeaths, maxRedDeaths;
var timeValue = 0;

var isPlaying = false;
var playerSpeed = 1;

var deathFilter = 'all';

class DeathMap extends React.Component {

  componentDidMount() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    this.loadDeaths();

    $(".btn-group > .btn").click(function(){
      $(this).addClass("active").siblings().removeClass("active");
    });
  }

  loadDeaths() {
  	this.httpGetAsync('/matches/deaths', this.processDeaths);
  }

  httpGetAsync(theUrl, callback) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
          if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
              callback(xmlHttp.responseText);
          }
      }
      xmlHttp.open("GET", theUrl, true); // true for asynchronous
      xmlHttp.send(null);
  }

  processDeaths(text) {
    rawDeaths = JSON.parse(text);
    filterDeaths();
  }

  render() {
    return(
      <div id="super-container" className="container champs-container">
        <div className="graphics-container">
          <div id='deaths-visualization'>
            <div id='animation-container'>
              <div id="role-selection-container">
                <div className="btn-group">
                  <button type="button" id="all-btn" className="btn btn-default active" onClick={()=> onLaneSelection('all')}>ALL</button>
                  <button type="button" id="top-btn" className="btn btn-default" onClick={()=> onLaneSelection('top')}>TOP</button>
                  <button type="button" id="jungle-btn" className="btn btn-default" onClick={()=> onLaneSelection('jungle')}>JUNGLE</button>
                  <button type="button" id="mid-btn" className="btn btn-default" onClick={()=> onLaneSelection('mid')}>MID</button>
                  <button type="button" id="adc-btn" className="btn btn-default" onClick={()=> onLaneSelection('adc')}>ADC</button>
                  <button type="button" id="supp-btn" className="btn btn-default" onClick={()=> onLaneSelection('supp')}>SUPPORT</button>
                </div>
              </div>
              <div id='canvas-container'>
                <img className='canvas-class' width="400" height="400" src="../static/images/samuels_rif.png"></img>
                <canvas id='canvas' className='canvas-class' width="400" height="400"></canvas>
              </div>
              <div id="progress-bar">
                <button id="player-button" className="btn btn-default" onClick={playerButtonPress}>
                  <span id="play-button-icon" className="glyphicon glyphicon-play"></span>
                </button>
                <div id="slidecontainer">
                  <input type="range" min="0" max="0" defaultValue="0" step="1" id="myRange" className="slider"
                  onMouseMove={onSlideChange} onClick={pausePlaying} onMouseDown={pausePlaying}/>
                </div>
                <span id="slider-time">00:00</span>
              </div>
            </div>
            <div id='deaths-chart'>
              <h4>Mortes</h4>
              <div className='team-bar'>
                <div id='blue-bar' className='death-bar'>
                  <span id='blue-span' className='team-span'>0</span>
                </div>
              </div>
              <div className='team-bar'>
                <div id='red-bar' className='death-bar'>
                  <span id='red-span' className='team-span'>0</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}

function filterDeaths() {
  deaths = [];
  max = 0;
  maxBlueDeaths = 0;
  maxRedDeaths = 0;
  for (let i in rawDeaths) {
    let item = rawDeaths[i];
    if (   deathFilter === 'all'
        || (deathFilter === 'adc' && item.victimRole === 'DUO_CARRY')
        || (deathFilter === 'supp' && item.victimRole === 'DUO_SUPPORT')
        || (deathFilter === 'mid' && item.victimRole === 'MIDDLE')
        || (deathFilter === 'jungle' && item.victimRole === 'JUNGLE')
        || (deathFilter === 'top' && item.victimRole === 'TOP')) {
      deaths.push(item);
      max = Math.max(max, item.timestamp + 100000)
      if (item.victimTeam === 'blue') maxBlueDeaths++; else maxRedDeaths++;
    }
  }
  $('#myRange').attr('max', max);
  updateDeaths();
}

function onLaneSelection(lane) {
  deathFilter = lane;
  filterDeaths();
}

function onSlideChange() {
    timeValue = + $('#myRange[type=range]').val()
    updateSliderTime();
    if (deaths !== undefined)
        updateDeaths();
}

function playerButtonPress() {
    if (!isPlaying) {
        console.log("Started playing!");
        $('.glyphicon').toggleClass('glyphicon-play glyphicon-pause')
        isPlaying = true;
        playStep();
    } else {
        pausePlaying();
    }
}

function updateDeaths() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let blues = 0, reds = 0;
    for (let i in deaths) {
        let item = deaths[i];
        if (item.timestamp < timeValue)
            if (item.victimTeam === 'blue') blues++; else reds++;
        drawDeath(SRposToCanvasXY(item.position), item.victimTeam, item.timestamp);
    }
    updateDeathChart(blues, reds);
}

function playStep() {
    timeValue += 1000 * playerSpeed;
    $('#myRange[type=range]').val(+timeValue);
    updateSliderTime();
    updateDeaths();
    if (isPlaying && timeValue < max) setTimeout(playStep, 16);
}

function updateSliderTime() {
    let mins = ('0' + parseInt(timeValue/(1000.*60))).slice(-2);
    let secs = ('0' + (parseInt(timeValue/1000) %60)).slice(-2);
    $('#slider-time').text(mins + ':' + secs);
}

function pausePlaying() {
  if (isPlaying) {
    $('.glyphicon').toggleClass('glyphicon-play glyphicon-pause')
    console.log("Paused...");
    isPlaying = false;
  }
}

function SRposToCanvasXY(pos) {
  return {'x': pos.x/14820*canvas.width, 'y': (1 - pos.y/14881)*canvas.height};
}

function updateDeathChart(blueDeaths, redDeaths) {

    $('.team-span').css('font-weight', 'bold');
    $('.death-bar').css('opacity', '1');

    let maxOfBoth = Math.max(maxBlueDeaths, maxRedDeaths)
    let new_blue = 10 + blueDeaths/maxOfBoth * 300;
    let new_red = 10 + redDeaths/maxOfBoth * 300;

    $('#blue-bar').height(new_blue);
    $('#red-bar').height(new_red);
    $('#blue-span').text(blueDeaths);
    $('#red-span').text(redDeaths);

    if (blueDeaths > redDeaths) {
        $('#red-span').css('font-weight', 'normal');
        $('#red-bar').css('opacity', '0.7');
    }
    else if (blueDeaths < redDeaths) {
        $('#blue-span').css('font-weight', 'normal');
        $('#blue-bar').css('opacity', '0.7');
    }
}

function drawDeath(pos, team, deathTime) {
    let time1 = -10000, time2 = 25000, time3 = 75000;
    let diff = timeValue - deathTime;

    ctx.fillStyle = team === 'red' ? "rgba(255, 0, 0, 1)" : "rgba(0, 0, 255, 1)";

    if (diff > time1 && diff < 0) {
        let alpha = 1 - diff/time1;
        let green = parseInt(250*diff/time1);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5 - 3*diff/time1, 0, 2 * Math.PI);
        ctx.fillStyle = team === 'red' ? "rgba(255," + green + ", 0," + alpha + ")" : "rgba(0," + green + ", 255," + alpha + ")";
        ctx.fill();
    } else if (diff >= 0 && diff < time2) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    } else if (diff >= time2 && diff < time3) {
        let alpha = 1 - (diff - time2)/(time3 - time2);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = team === 'red' ? "rgba(255, 0 , 0," + alpha + ")" : "rgba(0, 0, 255," + alpha + ")";
        ctx.fill();
    }
}

export default DeathMap;
