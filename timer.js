console.log("Its already time to premove!!");
var lichessGreen = '#759900';
var lichessRed = '#a00000';

$('body').append('<div id="myburner" class="timer"><svg class="rotate" viewbox="0 0 250 250"\><path id="myloader" transform="translate(125, 125)"/></svg></div>');
$('body').append('<div id="hisburner" class="timer"><svg class="rotate" viewbox="0 0 250 250"\><path id="hisloader" transform="translate(125, 125)"/></svg></div>');

$('#myburner, #hisburner').css({
    'position': 'absolute',
    'bottom': '0',
    'height': '300px',
    'width': '300px'
});
$('#hisburner').css({
     'left': '350px',
});
$('#myburner').css({
    'left': '0',
});

$('#myburner .timer, #hisburner .timer').css({
    'height': '300px',
    'width': '300px',
    'overflow': 'hidden',
    'margin': 'auto',
    'position': 'relative'
});
$('#myburner .rotate, #hisburner .rotate').css({
    'height': '100%',
    'width': '100%',
    'display': 'block',
    'position': 'relative',
    'z-index': '10'
});
$('#myloader').css({
    'fill': lichessGreen
});
$(' #hisloader').css({
    'fill': lichessRed
});

var myClock = $(".clock.clock_bottom"),
    hisClock = $(".clock.clock_top"),
    gameTime = 0,
    hisloader = $('#hisloader'),
    myloader = $('#myloader'),
    a = 0,
    p = Math.PI;

if ($('body').hasClass('playing')) {
    var myGameTime = getTime(myClock);
    var hisGameTime = getTime(hisClock);
    gameTime = myGameTime || hisGameTime;
    timeout();
}
function timeout() {
    setTimeout(() => {
        var myTime = getTime(myClock);
        var hisTime = getTime(hisClock);

        drawPie(myTime, myloader);
        drawPie(hisTime, hisloader);

        if (myTime > 0 && hisTime > 0 && $('body').hasClass('playing')) {
            timeout();
        }
    }, 200);
}

function getTime(clock) {
    return toSeconds($(clock).find('.time')[0].textContent);
}

function drawPie(time, loader) {
    time = time * 360 / gameTime;
    console.log(time)
    var r = ( time * p / 180 )
        , x = Math.sin( r ) * 125
        , y = Math.cos( r ) * - 125
        , mid = ( time > 180 ) ? 1 : 0
        , anim = 'M 0 0 v -125 A 125 125 0 '
            + mid + ' 1 '
            +  x  + ' '
            +  y  + ' z';

    $(loader).attr('d', anim);
}

function toSeconds(time_str) {
    if (time_str.indexOf('.') !== -1) {
        time_str = time_str.substr(0, time_str.indexOf('.'))
    }
    var parts = time_str.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}
