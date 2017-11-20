// browser.js
/**
 * @fileoverview Static Module. WEBSPELLCHECKER Browser module.
 */
(function() {
    function init(Namespace) {
        'use strict';

        if (Namespace.env !== Namespace.envTypes.browser) {
            return;
        }

        var Browser = (function() {
            var agent = navigator.userAgent.toLowerCase(),
                edge = agent.match(/edge[ \/](\d+.?\d*)/),
                trident = agent.indexOf('trident/') > -1,
                ie = !!( edge || trident ),
                opera = window.opera;

            var browser = {
                ie: ie,
                edge: !!edge,
                opera: (!!opera && opera.version),
                webkit: ( !ie && agent.indexOf(' applewebkit/') > -1 ),
                air: ( agent.indexOf(' adobeair/') > -1 ),
                mac: ( agent.indexOf('macintosh') > -1 ),
                quirks: ( document.compatMode == 'BackCompat' && (!document.documentMode || document.documentMode < 10) ),
                mobile: ( agent.indexOf('mobile') > -1 ),
                iOS: /(ipad|iphone|ipod)/.test(agent)
            };

            browser.gecko = (navigator.product == 'Gecko' && !browser.webkit && !browser.opera && !browser.ie);

            if (browser.webkit) {
                if ( agent.indexOf('chrome') > -1 ) {
                    browser.chrome = true;
                } else {
                    browser.safari = true;
                }
            }

            var version = 0;

            if (browser.ie) {
                if (edge) {
                    version = parseFloat(edge[1]);
                } else if (browser.quirks || !document.documentMode) {
                    version = parseFloat( agent.match(/msie (\d+)/)[1] );
                } else {
                    version = document.documentMode;
                }
            }

            // Gecko
            if (browser.gecko) {
                var geckoRelease = agent.match(/rv:([\d\.]+)/);
                if (geckoRelease) {
                    geckoRelease = geckoRelease[1].split('.');
                    version = geckoRelease[0] * 10000 + (geckoRelease[1] || 0) * 100 + (geckoRelease[2] || 0) * 1;
                }
            }

            // Adobe AIR 1.0+
            // Checked before Safari because AIR have the WebKit rich text editor
            // features from Safari 3.0.4, but the version reported is 420.
            if (browser.air)
                version = parseFloat( agent.match(/ adobeair\/(\d+)/)[1] );

            // WebKit 522+ (Safari 3+)
            if (browser.webkit)
                version = parseFloat( agent.match(/ applewebkit\/(\d+)/)[1] );

            browser.version = version;

            return browser;
        }());

        Namespace.Utils = Namespace.Utils || {};
        Namespace.Utils.Browser = Browser;
    }
    
    if (typeof window === 'undefined') {
        module.exports = init;
    }

    if (typeof WEBSPELLCHECKER !== 'undefined') {
        init(WEBSPELLCHECKER);
    }
})();