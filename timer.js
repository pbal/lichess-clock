console.log('chrome extension: lichess clock dials');

var burner = $(`
<div class="timer">
    <svg class="rotate" viewbox="0 0 250 250"\>
        <path class="loader" transform="translate(125, 125)"/>
    </svg>
</div>
`);

$('body').append($(burner).clone().attr('id', 'myburner'));
$('body').append($(burner).clone().attr('id', 'hisburner'));

var myClock = $(".clock.clock_bottom"),
    hisClock = $(".clock.clock_top"),
    gameTime = 0,
    hisloader = $('#hisburner .loader'),
    myloader = $('#myburner .loader'),
    a = 0,
    p = Math.PI,
    timeFormatSupport = true;

// read game time from lichess data obj
try {
    var scr = $("script")[2].textContent;
    scr = scr.substr(scr.indexOf('data: ') + 6);
    scr = scr.substr(0, scr.indexOf('i18n:'));
    scr = scr.substr(0, scr.lastIndexOf(',')).trim();
    var data = $.parseJSON(scr);
} catch(e) {
    console.log('Lichess Clock Chrome Extension load only while playing.');
}

if (data && data.clock && data.clock.increment) {
    timeFormatSupport = false;
    console.warn('Pie clocks doesn\'t work well with incremental time.');
}
if (timeFormatSupport && $('body').hasClass('playing')) {
    if (data && data.clock) {
        gameTime = data.clock.initial;
    } else {
        var myGameTime = getTime(myClock);
        var hisGameTime = getTime(hisClock);
        gameTime = myGameTime || hisGameTime;
    }
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
    time = 360 - time * 360 / gameTime || .1;

    var r = ( time * p / 180 ),
        x = Math.sin( r ) * 125,
        y = Math.cos( r ) * - 125,
        mid = ( time > 180 ) ? 0 : 1,
        anim = 'M 0 0 v -125 A 125 125 1 '
            + mid + ' 0 '
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
