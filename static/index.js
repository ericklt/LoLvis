var canvas;
var ctx;

var deaths;
var max;
var timeValue = 0;

var isPlaying = false;
var playerSpeed = 10;

window.onload = function() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
}

$("#myform").bind('ajax:complete', function(event) {
	console.log(event)
});

function jungle_deaths() {
	httpGetAsync('/matches/deaths', processJungleDeaths);
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

function processJungleDeaths(text) {
	deaths = JSON.parse(text);
	max = 0
    for (i in deaths)
        max = Math.max(max, deaths[i].timestamp)
    $('#myRange').attr('max', max);
    updateDeaths();
}

function updateDeaths() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (i in deaths) {
        item = deaths[i];
        if (item.timestamp <= timeValue)
            drawCircle(SRposToCanvasXY(item.position), item.team);
    }
}


function drawCircle(pos, color) {
    ctx.fillStyle = color == 'red' ? "#FF0000" : "#0000FF";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
    ctx.fill();
}

function onSlideChange() {
    timeValue = + $('#myRange[type=range]').val()
    if (deaths != undefined)
        updateDeaths();
}

function pausePlaying() {
    isPlaying = false;
}

function startPlaying() {
    if (!isPlaying) {
        console.log("started playing!")
        isPlaying = true;
        playStep();
    }
}

function playStep() {
    timeValue += 1000 * playerSpeed;
    $('#myRange[type=range]').val(+timeValue);
    updateDeaths();
    if (isPlaying && timeValue < max) setTimeout(playStep, 0.001);
}
