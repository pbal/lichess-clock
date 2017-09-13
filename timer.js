console.log('chrome extension: lichess clock dials');

var burner = `
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
`;
var myBurner = document.createElement('div');
var opBurner = document.createElement('div');

myBurner.setAttribute('id', 'myBurner');
opBurner.setAttribute('id', 'opBurner');

myBurner.innerHTML = burner;
opBurner.innerHTML = burner;

document.body.appendChild(opBurner);
document.body.appendChild(myBurner);

var myClock = document.querySelector('#lichess .clock.clock_bottom'),
    opClock = document.querySelector('#lichess .clock.clock_top'),
    mySpinner = myBurner.querySelector('.spinner'),
    opSpinner = opBurner.querySelector('.spinner'),
    gameTime = null,
    a = 0,
    p = Math.PI,
    alert = true,
    timeFormatSupport = true;

// read game time from lichess data obj
try {
    var script = document.querySelectorAll('script')[2].textContent;
    script = script.substr(script.indexOf('data: ') + 6);
    script = scr.substr(0, script.indexOf('i18n:'));
    script = script.substr(0, script.lastIndexOf(',')).trim();
    var data = JSON.parse(script);
} catch(e) {
    console.log('Lichess Clock Chrome Extension works only while playing.');
}

if (timeFormatSupport && document.body.classList.contains('playing')) {
    if (data && data.clock) {
        gameTime = data.clock.initial;
    } else {
        var myGameTime = getTime(myClock);
        var opGameTime = getTime(opClock);
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
        var opTime = getTime(opClock);

        if (data && data.clock && data.clock.increment) {
            drawIncrementDial(myTime, opTime);
        }
        else {
            drawSeparateDials(myTime, opTime);
        }

        if (myTime > 0 && opTime > 0 && document.body.classList.contains('playing')) {
            timeout();
        } else {
            mySpinner.classList.add('hide');
            opSpinner.classList.add('hide');
        }
    }, 200);
}

function drawSeparateDials(myTime, opTime) {
    drawPie(myTime, myBurner, mySpinner, opTime);
}

function drawSeparateDials(myTime, opTime) {
    drawPie(myTime, myBurner, mySpinner);
    drawPie(opTime, opBurner, opSpinner);
}

function getTime(clock) {
    var timer = clock.querySelector('.time');
    return timer ? toSeconds(timer.textContent) : 0;
}

function drawPie(time, clock, spinner, opTime = null) {

    if (time >= 7) spinner.classList.add('hide');
    else spinner.classList.remove('hide');

    if (opTime !== null) {
        var m = (360 - (time / (time + opTime)) * 360) || .01;
        var h = ((opTime / (time + opTime)) * 360) || .01;
        pie(m, clock.querySelector('.loader'));
        pie(h, clock.querySelector('.oploader'), true);
    } else {
        time = 360 - time * 360 / gameTime || .01;
        pie(time, clock.querySelector('.loader'), false);
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
    loader.setAttribute('d', anim);
}

function toSeconds(time) {
    var parts = time.trim().split(':');
    var m = parseInt(parts[0]);
    var secParts = parts[1].split('.');
    var s = parseInt(secParts[0]);
    var h = secParts.length > 1 ? parseInt(secParts[1].substr(0, 1)) : 0;
    var val = m * 60 + s + h / 10;
    return val;
}
