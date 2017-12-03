var canvas;
var ctx;

var deaths;
var max;
var timeValue = 0;

var isPlaying = false;
var playerSpeed = 1;

window.onload = function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    loadDeaths();
    $('#myRange').mousedown(pausePlaying);
}

$("#myform").bind('ajax:complete', function(event) {
	console.log(event)
});

function loadDeaths() {
	httpGetAsync('/matches/deaths', processDeaths);
}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function SRposToCanvasXY(pos) {
    return {'x': pos.x/14820*canvas.width, 'y': (1 - pos.y/14881)*canvas.height};
}

function processDeaths(text) {
	deaths = JSON.parse(text);
	max = 0
    for (i in deaths)
        max = Math.max(max, deaths[i].timestamp + 100000)
    $('#myRange').attr('max', max);
    updateDeaths();
}

function updateDeathChart(blue_deaths, red_deaths) {

    $('.team-span').css('font-weight', 'bold');
    $('.death-bar').css('opacity', '1');

    new_blue = (blue_deaths == red_deaths)? 150 : 300 * blue_deaths / (blue_deaths + red_deaths);
    new_red = (blue_deaths == red_deaths)? 150 : 300 * red_deaths / (blue_deaths + red_deaths);

    $('#blue-bar').height(new_blue);
    $('#red-bar').height(new_red);
    $('#blue-span').text(blue_deaths);
    $('#red-span').text(red_deaths);

    if (blue_deaths > red_deaths) {
        $('#red-span').css('font-weight', 'normal');
        $('#red-bar').css('opacity', '0.7');
    } 
    else if (blue_deaths < red_deaths) {
        $('#blue-span').css('font-weight', 'normal');
        $('#blue-bar').css('opacity', '0.7');
    }
}

function updateDeaths() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let blues = 0, reds = 0;
    for (i in deaths) {
        item = deaths[i];
        if (item.timestamp < timeValue)
            if (item.victimTeam == 'blue') blues++; else reds++;
        drawDeath(SRposToCanvasXY(item.position), item.victimTeam, item.timestamp);
    }
    updateDeathChart(blues, reds);
}

function drawDeath(pos, team, deathTime) {
    let time1 = -10000, time2 = 25000, time3 = 75000;
    let diff = timeValue - deathTime;
    
    ctx.fillStyle = team == 'red' ? "rgba(255, 0, 0, 1)" : "rgba(0, 0, 255, 1)";

    if (diff > time1 && diff < 0) {
        let alpha = 1 - diff/time1;
        let green = parseInt(250*diff/time1);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5 - 3*diff/time1, 0, 2 * Math.PI);
        ctx.fillStyle = team == 'red' ? "rgba(255," + green + ", 0," + alpha + ")" : "rgba(0," + green + ", 255," + alpha + ")";
        ctx.fill();
    } else if (diff >= 0 && diff < time2) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI); 
        ctx.fill();
        // let radius = 4 + 3 * diff/25000;
        // ctx.beginPath();
        // ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        // ctx.stroke();
    } else if (diff >= time2 && diff < time3) {
        let alpha = 1 - (diff - time2)/(time3 - time2);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = team == 'red' ? "rgba(255, 0 , 0," + alpha + ")" : "rgba(0, 0, 255," + alpha + ")";
        ctx.fill();
        // ctx.strokeStyle = ctx.fillStyle;
        // let radius = 7 + 3 * (diff - 25000)/50000;
        // ctx.beginPath();
        // ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        // ctx.stroke();
    }
}

function onSlideChange() {
    timeValue = + $('#myRange[type=range]').val()
    updateSliderTime();
    if (deaths != undefined)
        updateDeaths();
}

function pausePlaying() {
    if (isPlaying) {
        console.log("Paused...");
        isPlaying = false;
    }
}

function playerButtonPress() {
    if (!isPlaying) {
        console.log("Started playing!");
        isPlaying = true;
        playStep();
    } else {
        pausePlaying();
    }
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
