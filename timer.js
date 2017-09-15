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

var myLoader = myBurner.querySelector('.loader');
var opLoader = opBurner.querySelector('.loader');

var myClock = document.querySelector('#lichess .clock.clock_bottom'),
    opClock = document.querySelector('#lichess .clock.clock_top'),
    mySpinner = myBurner.querySelector('.spinner'),
    opSpinner = opBurner.querySelector('.spinner'),
    gameTime = null,
    a = 0,
    p = Math.PI,
    alert = true,
    timeFormatSupport = true,
    isAlertOn = false;

// read game time from lichess data obj
try {
    var script = document.querySelectorAll('script')[2].textContent;
    script = script.substr(script.indexOf('data: ') + 6);
    script = script.substr(0, script.indexOf('i18n:'));
    script = script.substr(0, script.lastIndexOf(',')).trim();
    var data = JSON.parse(script);
} catch(e) {
    console.log('Lichess Clock data not available on this page for clocks chrome extension.');
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
        drawDial(true);
        timeout();
    }
}
function drawDial(force) {
    var myTime = getTime(myClock);
    var opTime = getTime(opClock);
    if (data && data.clock && data.clock.increment) {
        drawIncrementDial(myTime, opTime);
    }
    else {
        drawSeparateDials(myTime, opTime, force);
    }
}

function timeout() {
    setTimeout(() => {
        drawDial(false);

        if (document.body.classList.contains('playing')) {
            timeout();
        } else {
            mySpinner.classList.add('hide');
            opSpinner.classList.add('hide');
        }
    }, 100);
}

function drawIncrementDial(myTime, opTime) {
    drawPie(myTime, myBurner, mySpinner, myLoader, opTime);
}

function drawSeparateDials(myTime, opTime, force) {
    if (force || myClock.classList.contains('running')) {
        drawPie(myTime, myBurner, mySpinner, myLoader);
    } 
    if (force || opClock.classList.contains('running')) {
        drawPie(opTime, opBurner, opSpinner, opLoader);
    }
}

function getTime(clock) {
    var timer = clock.querySelector('.time');
    return timer ? toSeconds(timer.textContent) : 0;
}

function drawPie(time, clock, spinner, loader, opTime = null) {
    if (time < 7 && !isAlertOn) {
        spinner.classList.remove('hide');
        isAlertOn = true;
    }
    else if (time >= 7 && opTime !== null && isAlertOn) {
        spinner.classList.add('hide');
        isAlertOn = false;
    }

    if (opTime === null) {
        // 2 dials
        time = 360 - time * 360 / gameTime || .01;
        pie(time, loader, false);
    } else {
        // incremental 1 dial
        var m = (360 - (time / (time + opTime)) * 360) || .01;
        var h = ((opTime / (time + opTime)) * 360) || .01;
        pie(m, loader);
        pie(h, clock.querySelector('.oploader'), true);
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
