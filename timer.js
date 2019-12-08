(function () {
    console.log('clock extension: lichess animated clocks');

    var lichess = document.querySelector('#main-wrap');
    var p = Math.PI,
        myBurner, myLoader, mySpinner, opIncLoader,
        opBurner, opLoader, opSpinner,
        myClock, opClock;

    var myGlobalTime, opGlobalTime;
    // read game time from lichess data obj
    try {
        var script = document.querySelectorAll('script')[2].textContent;
        script = script.substr(script.indexOf('data: ') + 6);
        script = script.substr(0, script.indexOf('i18n:'));
        script = script.substr(0, script.lastIndexOf(',')).trim();
        var data = JSON.parse(script);
    } catch (e) {
        console.log('clock extension: Lichess clock data not available on this page.');
    }

    setTimeout(function () {
        myClock = lichess.querySelector('.rclock.rclock-bottom'),
            opClock = lichess.querySelector('.rclock.rclock-top');
        if (document.body.classList.contains('playing')) {
            myGlobalTime = readTime(myClock);
            opGlobalTime = readTime(opClock);

            chrome.storage.sync.get({
                clockFace: 'dials'
            }, function (items) {
                switch (items.clockFace) {
                    case 'dials':
                        insertDials();
                        tickDial();
                        break;
                    case 'incbar':
                        insertBar(true);
                        tickBar(1);
                        break;
                    case 'decbar':
                        insertBar();
                        tickBar(2);
                        break;
                    case 'para':
                        insertBar(false, false, 'parbar');
                        tickBar(2);
                        break;
                    case 'fsee':
                        insertBar();
                        tickBar(3);
                        break;
                    default:
                        console.warn('clock face not supported');
                }
            });
        }
    }, 500);

    function insertBar(inc, separator = true, style = '') {
        var liGround = lichess.querySelector('.lichess_ground');
        var liGroundParent = liGround.parentNode;
        liGround.classList.add('incont');

        var burnerDiv = document.createElement('div');
        burnerDiv.classList.add('incbar');
        style ? burnerDiv.classList.add(style) : 0;

        var myBurnerContainer = document.createElement('div');
        var opBurnerContainer = document.createElement('div');

        myBurner = document.createElement('div');
        opBurner = document.createElement('div');
        myBurner.classList.add('myBurner');
        opBurner.classList.add('opBurner');

        myBurnerContainer.appendChild(myBurner);
        opBurnerContainer.appendChild(opBurner);

        var sep = document.createElement('div');
        sep.classList.add('sep');

        if (inc) {
            burnerDiv.appendChild(myBurnerContainer);
            separator ? burnerDiv.appendChild(sep) : 0;
            burnerDiv.appendChild(opBurnerContainer);
        }
        else {
            burnerDiv.appendChild(opBurnerContainer);
            separator ? burnerDiv.appendChild(sep) : 0;
            burnerDiv.appendChild(myBurnerContainer);
        }
        liGroundParent.insertBefore(burnerDiv, liGround);
    }

    function insertDials() {
        var burner = `
        <svg class='timer rotate'>
            <path class='loader' transform='translate(120, 120)'/>
            <path class='oploader' transform='translate(120, 120)'/>
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

        myBurner = document.createElement('div');
        opBurner = document.createElement('div');
        myBurner.setAttribute('id', 'myBurner');
        opBurner.setAttribute('id', 'opBurner');
        myBurner.innerHTML = burner;
        opBurner.innerHTML = burner;

        lichess.appendChild(opBurner);
        lichess.appendChild(myBurner);

        myLoader = myBurner.querySelector('.loader');
        opIncLoader = myBurner.querySelector('.oploader');
        opLoader = opBurner.querySelector('.loader');

        mySpinner = myBurner.querySelector('.spinner');
        opSpinner = opBurner.querySelector('.spinner');
    }

    function tickDial() {
        setTimeout(function () {
            var myTime = readTime(myClock);
            var opTime = readTime(opClock);

            var myEmerg = myClock.classList.contains('emerg');
            var opEmerg = opClock.classList.contains('emerg');

            // incremental
            if (data && data.clock && data.clock.increment) {
                drawPie(myTime, myBurner, mySpinner, myLoader, myEmerg, opTime);
            } else {
                // 2 dials
                drawPie(myTime, myBurner, mySpinner, myLoader, myEmerg);
                drawPie(opTime, opBurner, opSpinner, opLoader, opEmerg);
            }

            if (document.body.classList.contains('playing')) {
                tickDial();
            } else {
                mySpinner.classList.add('hide');
                opSpinner.classList.add('hide');
            }
        }, 500);
    }

    function tickBar(mode) {
        setTimeout(function () {
            var myTime = readTime(myClock);
            var opTime = readTime(opClock);

            switch (mode) {
                case 1:
                    drawIncBar(myTime, opTime);
                    break;
                case 2:
                    drawDecBar(myTime, opTime);
                    break;
                case 3:
                    drawFullSeeSaw(myTime, opTime);
                    break;
            }
            if (document.body.classList.contains('playing')) {
                tickBar(mode);
            }
        }, 500);
    }

    function drawIncBar(myTime, opTime) {
        if (myTime === opTime) {
            myBurner.style.height = '0%';
            opBurner.style.height = '0%';
        } else if (myTime > opTime) {
            myBurner.style.height = ((myTime - opTime) / myTime * 100) + '%';
            opBurner.style.height = '0%';
        } else {
            opBurner.style.height = ((opTime - myTime) / opTime * 100) + '%';
            myBurner.style.height = '0%';
        }
    }

    function drawDecBar(myTime, opTime) {
        myBurner.style.height = myTime * 100 + '%';
        opBurner.style.height = opTime * 100 + '%';
    }

    function drawFullSeeSaw(myTime, opTime) {
        myBurner.style.height = (((myTime - opTime) / myTime)) * 100 + '%';
        opBurner.style.height = (100 - (((myTime - opTime) / myTime)) * 100) + '%';
    }

    function drawPie(time, clock, spinner, loader, emerg, opTime = null) {
        if (emerg) {
            spinner.classList.remove('hide');
        } else {
            spinner.classList.add('hide');
        }

        if (opTime === null) {
            // 2 dials

            var ca = myGlobalTime - time;
            time = 360 - (time / myGlobalTime) * 360 || .01;
            pie(time, loader, false);
        } else {
            // incremental 1 dial
            var m = 360 - (time / (time + opTime)) * 360 || .01;
            var h = ((opTime / (time + opTime)) * 360) || .01;

            pie(m, loader);
            pie(h, opIncLoader, true);
        }
    }

    function pie(time, loader, reverse) {
        var r = (time * p / 180),
            x = Math.sin(r) * 120,
            y = Math.cos(r) * -120,
            mid = (time > 180) ? reverse ? 1 : 0 : reverse ? 0 : 1,
            anim = 'M 0 0 v -120 A 120 120 1 '
                + mid + (reverse ? ' 1 ' : ' 0 ')
                + x + ' '
                + y + ' z';
        loader.setAttribute('d', anim);
    }

    function readTime(clock) {
        var timer = clock.querySelector('.time');
        if (!timer) return;
        var a = timer.textContent.split(':');
        var seconds = (+a[0]) * 60 + (+a[1]);

        return seconds;
    }
})();
