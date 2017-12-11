// regularssources.js
/**
 * @fileoverview Static Module.
 */
(function() {
    function init(Namespace) {
        'use strict';

        var RegularsSources = {
            space: "[\\s\\xA0]",
            commonSpace: " ",
            quotes: "'\"",
            nonWhiteSpaceChar: "\\S",
            dot: '\\.',
            anyChar: '.',
            comma: '\\,',
            EOL: '[\r\n(\r\n)]',
            digits : '[0-9]',
            //Punctuations
            HtmlSpaceSymbol:  String.fromCharCode(160),
            // \u061F - Arabic question mark, \u060C - Arabic comma, \u061B - Arabic semicolon
            textPunctuation: " ,\"\^\$\*\+\?\=\!\:\|\\\/\\(\\)\\[\\]\\{\\}\\>\\<\\@\\%\\&\\#\\;\\_\\~\\u061F\\u060C\\u061B\\u0001-\\u001F\\u0080-\\u00B6\\u00B8-\\u00BF\\u2000-\\u200A\\u200C-\\u266F\\u2E00-\\u2E7F",
            situationalSeparators: "\\.\\-\\'",
            sentenceEndChars: "\\.!?",
            specialCharacters: String.fromCharCode(8203) + String.fromCharCode(65279),
            ip: '/^((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))*$/',
            twoAndMore: '{2,}',
            whiteSpace: " \\f\\n\\r\\t\\v\\uFEFF\\u0085\\u00A0\\u1680\\u180E\\u2000-\\u200C\\u2028\\u2029\\u202F\\u205F\\u3000"
        };

        Namespace.RegularsSources = RegularsSources;
    }

    if (typeof window === 'undefined') {
        module.exports = init;
    }

    if (typeof WEBSPELLCHECKER !== 'undefined') {
        init(WEBSPELLCHECKER);
    }
})();