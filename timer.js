// Pie Clock design based on
// https://medium.com/@andsens/radial-progress-indicator-using-css-a917b80c43f9

console.log('chrome extension: lichess clock dials');

var myClock = $(".clock.clock_bottom"),
hisClock = $(".clock.clock_top"),
gameTime = 0,
timeFormatSupport = true;

// read game time from lichess data obj
try {
    var scr = $("script")[2].textContent;
    scr = scr.substr(scr.indexOf('data: ') + 6);
    scr = scr.substr(0, scr.indexOf('i18n:'));
    scr = scr.substr(0, scr.lastIndexOf(',')).trim();
    var data = $.parseJSON(scr);
} catch(e) {
    console.warn('Lichess Clock Chrome Extension load only while playing.');
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
}

$(document).ready(() => {
    if (gameTime) {
        buildClocks();
        checkTime();
    }
});

function buildClocks() {

    var dial = $(`
    <div class="radial" data-time="0">
        <div class="circle">
            <div class="mask full">
                <div class="fill"></div>
            </div>
            <div class="mask half">
                <div class="fill"></div>
                <div class="fill fix"></div>
            </div>

            <div class="shadow"></div>

        </div>
    </div>`);
    $('body').append($(dial).clone().attr('id', 'myloader'));
    $('body').append($(dial).clone().attr('id', 'hisloader'));

    var hisloader = $('#hisloader'),
        myloader = $('#myloader');
}

function checkTime() {
    setTimeout(() => {
        var myTime = getTime(myClock);
        var hisTime = getTime(hisClock);

        drawPie(myTime, myloader);
        drawPie(hisTime, hisloader);
        console.log(myTime  )
        if (myTime > 0 && hisTime > 0 && $('body').hasClass('playing')) {
            checkTime();
        }
    }, 200);
}

function getTime(clock) {
    return toSeconds($(clock).find('.time')[0].textContent);
}

function drawPie(time, loader) {
    time = gameTime - time;
    var percentage = time / gameTime * 100;
    $(loader).attr('data-time', parseInt(percentage));
}

function toSeconds(time_str) {
    if (time_str.indexOf('.') !== -1) {
        time_str = time_str.substr(0, time_str.indexOf('.'))
    }
    var parts = time_str.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}
