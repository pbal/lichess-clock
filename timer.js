console.log('chrome extension: lichess clock dials');

var burner = $(`
    <svg class='timer rotate'>
        <path class='loader' transform='translate(140, 140)'/>
        <path class='oploader' transform='translate(140, 140)'/>
        <path class='spinner hide'
            d='M25.251,6.411c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z' >
        <animateTransform attributeType='xml' attributeName='transform'
            type='rotate'
            from='0 25 25'
            to='360 25 25'
            dur='.5s' repeatCount='indefinite'/>
        </path>
    </svg>
`);

$('body').append($(burner).clone().attr('id', 'myBurner'));
$('body').append($(burner).clone().attr('id', 'opBurner'));

var myClock = $('.clock.clock_bottom'),
    hisClock = $('.clock.clock_top'),
    myBurner = $('#myBurner'),
    opBurner = $('#opBurner'),
    mySpinner = $('#myBurner .spinner'),
    opSpinner = $('#opBurner .spinner'),
    gameTime = null,
    a = 0,
    p = Math.PI,
    alert = true,
    timeFormatSupport = true;

// read game time from lichess data obj
try {
    var scr = $('script')[2].textContent;
    scr = scr.substr(scr.indexOf('data: ') + 6);
    scr = scr.substr(0, scr.indexOf('i18n:'));
    scr = scr.substr(0, scr.lastIndexOf(',')).trim();
    var data = $.parseJSON(scr);
} catch(e) {
    console.log('Lichess Clock Chrome Extension works only while playing.');
}

if (timeFormatSupport && $('body').hasClass('playing')) {
    if (data && data.clock) {
        gameTime = data.clock.initial;
    } else {
        var myGameTime = getTime(myClock);
        var hisGameTime = getTime(hisClock);
        gameTime = myGameTime || hisGameTime;
    }
    // dont show when game time is not determined
    if (gameTime !== null) {
        timeout();
    }
}

function timeout() {
    setTimeout(() => {
        var myTime = getTime(myClock);
        var opTime = getTime(hisClock);

        if (data && data.clock && data.clock.increment) {
            drawPie(myTime, myBurner, mySpinner, opTime);
        }
        else {
            drawPie(myTime, myBurner, mySpinner);
            drawPie(opTime, opBurner, opSpinner);
        }
        if (myTime > 0 && opTime > 0 && $('body').hasClass('playing')) {
            timeout();
        } else {
            $('#myBurner .spinner').addClass('hide');
            $('#opBurner .spinner').addClass('hide');
        }
    }, 200);
}

function getTime(clock) {
    var timer = $(clock).find('.time');
    return timer.length ? toSeconds(timer[0].textContent) : 0;
}

function drawPie(time, clock, spinner, opTime = null) {

    $(spinner).addClass(time >= 7 ? 'hide' : '');
    $(spinner).removeClass(time < 7 ? 'hide' : '');

    if (opTime !== null) {
        var m = (360 - (time / (time + opTime)) * 360) || .01;
        var h = ((opTime / (time + opTime)) * 360) || .01;
        pie(m, $(clock).find('.loader'));
        pie(h, $(clock).find('.oploader'), true);
    } else {
        time = 360 - time * 360 / gameTime || .01;
        pie(time, $(clock).find('.loader'), false);
    }
}

function pie(time, loader, reverse) {
    var r = ( time * p / 180 ),
    x = Math.sin( r ) * 125,
    y = Math.cos( r ) * - 125,
    mid = ( time > 180) ? reverse ? 1 : 0 : reverse ? 0 : 1,
    anim = 'M 0 0 v -125 A 125 125 1 '
        + mid + (reverse ? ' 1 ' : ' 0 ')
        +  x  + ' '
        +  y  + ' z';
    $(loader).attr('d', anim);
}

function toSeconds(time) {
    time = time.trim();
    var parts = time.split(':');
    var m = parseInt(parts[0]);
    var secParts = parts[1].split('.');
    var s = parseInt(secParts[0]);
    var h = secParts.length > 1 ? parseInt(secParts[1].substr(0, 1)) : 0;
    var val = m * 60 + s + h / 10;
    return val;
}
