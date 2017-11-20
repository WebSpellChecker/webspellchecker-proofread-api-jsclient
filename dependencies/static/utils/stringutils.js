// stringutils.js
/**
 * @fileoverview Static Module. WEBSPELLCHECKER StringUtils module.
 */
(function() {
    function init(Namespace) {
        'use strict';

        var StringUtils = {
            splice: function(string, startIndex, length, insertString){
                return string.substring(0, startIndex) + insertString + string.substring(startIndex + length);
            },
            replaceFromTo: function(string, from, to, insertString){
                return string.substring(0, from) + insertString + string.substring(to);
            }
        };

        Namespace.Utils = Namespace.Utils || {};
        Namespace.Utils.StringUtils = StringUtils;
    }

    if (typeof window === 'undefined') {
        module.exports = init;
    }

    if (typeof WEBSPELLCHECKER !== 'undefined') {
        init(WEBSPELLCHECKER);
    }
})();