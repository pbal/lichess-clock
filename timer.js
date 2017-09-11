console.log('chrome extension: lichess clock dials');

var burner = $(`
<svg class="timer rotate" >
    <path class="loader" transform="translate(140, 140)"/>
    <path class="spinner hide"
    d="M25.251,6.411c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615V6.461z" >
    <animateTransform attributeType="xml" attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur=".5s"
        repeatCount="indefinite"/>
    </path>
</svg>
`);

$('body').append($(burner).clone().attr('id', 'myburner'));
$('body').append($(burner).clone().attr('id', 'hisburner'));

var myClock = $(".clock.clock_bottom"),
    hisClock = $(".clock.clock_top"),
    gameTime = 0,
    a = 0,
    p = Math.PI,
    alert = false,
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

        drawPie(myTime, 'myburner');
        drawPie(hisTime, 'hisburner');

        if (myTime > 0 && hisTime > 0 && $('body').hasClass('playing')) {
            timeout();
        } else {
            $('#myburner .spinner').addClass('hide');
            $('#hisburner .spinner').addClass('hide');
        }
    }, 200);
}

function getTime(clock) {
    return toSeconds($(clock).find('.time')[0].textContent);
}

function drawPie(time, clockid) {
    var clock = $('#' + clockid);
    if (time <= 7 && !alert) {
        $(clock).find('.spinner').addClass('alert');
        $(clock).find('.spinner').removeClass('hide');
        alert = true;
    }
    time = 360 - time * 360 / gameTime || .1;
    var r = ( time * p / 180 ),
        x = Math.sin( r ) * 125,
        y = Math.cos( r ) * - 125,
        mid = ( time > 180 ) ? 0 : 1,
        anim = 'M 0 0 v -125 A 125 125 1 '
            + mid + ' 0 '
            +  x  + ' '
            +  y  + ' z';

    $('#' + clockid +' .loader').attr('d', anim);
}

function toSeconds(time) {
    time = time.trim();
    var parts = time.split(':');
    var val = parseInt(parts[0]) * 60 + parseInt(parts[1].split('.')[0]) + ((parseInt(parts[1].split('.')[1]) || 0) / 10);
    return val;
}
