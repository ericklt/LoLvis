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

function updateDeaths() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (i in deaths) {
        item = deaths[i];
        drawDeath(SRposToCanvasXY(item.position), item.victimTeam, item.timestamp);
    }
}

function drawDeath(pos, team, deathTime) {
    let diff = timeValue - deathTime;
    ctx.fillStyle = team == 'red' ? "rgba(255, 0, 0, 1)" : "rgba(0, 0, 255, 1)";
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 1;
    if (diff > -10000 && diff < 0) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 2 + Math.abs(18 * diff/10000), 0, 2 * Math.PI);
        ctx.lineWidth = 4 - 3*Math.abs(diff/10000);
        ctx.stroke();
    } else if (diff >= 0 && diff < 25000) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        let radius = 5 + 5 * diff/25000;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    } else if (diff >= 25000 && diff < 50000) {
        let alpha = 1 - (diff - 25000)/25000;
        ctx.fillStyle = team == 'red' ? "rgba(255, 0, 0," + alpha + ")" : "rgba(0, 0, 255," + alpha + ")";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = ctx.fillStyle;
        let radius = 10 + 5 * (diff - 25000)/25000;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

function onSlideChange() {
    timeValue = + $('#myRange[type=range]').val()
    if (deaths != undefined)
        updateDeaths();
}

function pausePlaying() {
    console.log("Paused...");
    isPlaying = false;
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
    updateDeaths();
    if (isPlaying && timeValue < max) setTimeout(playStep, 16);
}
