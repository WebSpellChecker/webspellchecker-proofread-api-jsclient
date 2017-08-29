// TextProcessor.js
/**
 * @fileoverview Static Module. TextProcessor.
 */
(function(){
    'use strict';
	function init( Namespace ) {

        var RegularsManager = Namespace.RegularsManager,
            StringUtils = Namespace.Utils.StringUtils;

        /**
         * Represents TextProcessor Module.
         *
         * @constructor
         * @alias WEBSPELLCHECKER.TextProcessor
         *
         * @param {String} moduleId - Moduloe name;
         * @param {Object} appInstance - Instance of main app.
         * @private
         */
        function TextProcessor(moduleId, appInstance) {
            this.moduleId = moduleId;
            this.appInstance = appInstance;
        }

        TextProcessor.prototype = {
            constructor: TextProcessor,
            /**
             * Method what replacing separators(punctuation, symbols, quots) on spacces* Method for placing separators(punctuation, symbols, quotes) on spaces.
             * @memberof WEBSPELLCHECKER.TextProcessor#
             *
             * @param {String} text - Text for replacing separators.
             *
             * @returns {String} - text without separators.
             * @private
             */
            replaceSepatators: function(text) {
                var _situationalSepSetGlob,
                    customPunctuation = this.appInstance.getOption('customPunctuation');

                    RegularsManager.addRegularType('customPunctuation', customPunctuation);
                text = RegularsManager.HtmlSpaceSymbol.compositionGraph([
                    RegularsManager.textPunctuation,
                    RegularsManager.customPunctuation,
                    RegularsManager.EOL
                ]).g().set()
                .init(text)
                .replace(' ')
                .getString();

                _situationalSepSetGlob = RegularsManager.situationalSeparators
                    .set().g();

                // replace(/([\.\-\']{2,})/g, '#$1#')
                text = _situationalSepSetGlob
                    .composition(RegularsManager.twoAndMore)
                    .init(text)
                    .wrapInclude("#")
                    .getString();

                // replace(/#[\.\-\']|[\.\-\']#/g, ' ')
                text = _situationalSepSetGlob
                    .init(text)
                    .replaceLeftWrapped('#', ' ')
                    .replaceRightWrapped('#', ' ')
                    .getString();

                // replace( new RegExp( ' [\-\'\.]|[\-\'\.] ', 'g' ), '  ' )
                // replace( new RegExp( '^[\-\'\.]|[\-\'\.]$', 'g' ), ' ' )
                text = _situationalSepSetGlob
                    .init(text)
                    .replaceRightWrapped(' ', '  ')
                    .replaceLeftWrapped(' ', '  ')
                    .start().or( _situationalSepSetGlob.end() )
                    .replace(' ')
                    .getString();

                return text;
            },
            /**
             * Method what remove special characters.
             * @memberof WEBSPELLCHECKER.TextProcessor#
             *
             * @param {String} text - Text for removing special characters.
             *
             * @returns {String} - Text without special characters.
             * @private
             */
            removeSpecialCharacters: function(text) {
                return RegularsManager.specialCharacters.
                    init(text).g().replace('').getString();
            },
            /**
             * Method what collect offsets in text for current word.
             * @memberof WEBSPELLCHECKER.TextProcessor#
             *
             * @param {String} word - Words for which we are looking for offsets.
             * @param {String} text - Text with words.
             *
             * @returns {Object} - Start and end offsets.
             * @private
             */
            getWordOffsets: function(word, text) {
                var startOffset = text.indexOf(word),
                    endOffset = startOffset + word.length;

                return {
                    startOffset: startOffset,
                    endOffset: endOffset
                };
            },
            /**
             * API method what collect words from original text.
             * @memberof WEBSPELLCHECKER.TextProcessor#
             *
             * @param {String} text - Original text.
             *
             * @returns {Object} - Object with array of words and collection of words offsets.
             */
            getWordsFromString: function(text) {
                var minWordLength = this.appInstance.getOption('minWordLength'),
                    wordsCollection = [],
                    wordsOffsets,
                    result,
                    self = this;

                text = this.replaceSepatators(text);
                text = this.removeSpecialCharacters(text);


                wordsOffsets = RegularsManager.space
                    .init(text)
                    .split()
                    .reduce(function(prev, word) {
                        var wordObject;
                        if (word !== '' && word.length >= minWordLength ) {
                            if( !wordsCollection.includes(word) ) {
                                wordsCollection.push(word);
                            }
                            wordObject = self.getWordOffsets(word, text);
                            wordObject.word = word;
                            prev.push(wordObject);
                            text = StringUtils.replaceFromTo(text, wordObject.startOffset, wordObject.endOffset, new Array(word.length + 1).join(' ') );
                        }
                        return prev;
                    }, []);

                return {
                    wordsOffsets: wordsOffsets,
                    wordsCollection: wordsCollection
                };
            }

        };

        Namespace.TextProcessor = TextProcessor;
    }
    if(typeof window === 'undefined') {module.exports = init;}
	if(typeof WEBSPELLCHECKER !== 'undefined') {init(WEBSPELLCHECKER);}

})();
    /*
numbers
/[0-9]/g
/\d/g

dots
/\./g

spaces
/[\t|\v|\f|\r]+/g;
/\s/
/ /g
/\s/g
/.\s\xA0/
/.\s\xA0/
/&nbsp;/g, ' '

formating
/\r\n/g
/\n/gi
/\t/gi
/[\r\n(\r\n)]/g replace new line characters with space
/\r\n/
/[\r\t\n]/g
/\r\n/g
/\n/g
/\r/g

all
/./g

html
/<meta.*?>/i mta tags
/style="[^\"]*"/gi style attr
/<br>/gi
/style="[^\"]*"/gi
 new RegExp('<(' + blockElements + ')(>|.*?[^?]>)', 'gi'), '<br class="scayt-marker">$&' ) // add <br> before block tags
new RegExp('<\/(' + blockElements + ')(>|.*?[^?]>)', 'gi'), '$&<br class="scayt-marker">' ) // add <br> after block tags
/<br class="scayt-marker">\s*<br class="scayt-marker">/gi, '<br class="scayt-marker">' ) // replace double <br> with single <br>
/^(<br class="scayt-marker">)+/gi, '') // remove <br> from the start of the string
/(<br class="scayt-marker">)+$/gi, '') // remove <br> from the end of the string
/<br class="scayt-marker">/gi, '\r\n' )
/<br>/gi, '\r\n' )
/<meta.*?>/i
/<br[^>]*class[^>]*=[^>]*"[^>]*scayt-bogus[^>]*"[^>]*>/g // remove bogus <BR> if so
new RegExp('\\b' + defaultIgnoredTagNames[i] + '\\b', 'g')
for now this method appliable only to text based controls (input, textarea)
/</gi
/>/gi
new RegExp(
					'<[\s]*[a-z0-9]+[\s]*>' + '|' + 		// open tag
					'<[\s]*\/[\s]*[a-z0-9]+[\s]*>' + '|' + 	// close tag
					'<[\s]*[a-z0-9]+[\s]*\/[\s]*>'		 	// single self-closing tag
					, 'gi'									// global and not register sensitive
                );

/<\/?[A-Z]+>/g



formats
/text\/plain/
/text\/html/
/text\/plain/

signals

sentenceEndChars = /[.!?\n][\s\xA0]*$/g
nonWhiteSpaceChar = /\S/

spaceAndDotRegExp = /.\s\xA0/
wordBoundaryRegex = new RegExp('[' + spaceAndDotRegExp.source + punctuationRegExp.source + ']', 'g')
bookmarkClassRegex = new RegExp("(^|\\s)rangySelectionBoundary(\\s|$)"),
wordRegex = /[^\t-\r \u0085\u00A0\u1680\u180E\u2000-\u200B\u2028\u2029\u202F\u205F\u3000]+/g,


sentenceEndChars = /[.!?\n][\s\xA0]*$/g
nonWhiteSpaceChar = /\S/;
bookmarkClassRegex = new RegExp("(^|\\s)rangySelectionBoundary(\\s|$)"),
findStopChars = /[.!?\n](?=[\s\xA0]?)/gm;
/[\n|\t|\v|\f|\r]+/g
/[^A-ZА-Яа-яa-zЁё0-9_]/g
/[A-ZА-Я]/g
/!/\b/
/_/g

bookmarkClassRegex = new RegExp("(^|\\s)rangySelectionBoundary(\\s|$)");
bookmarkClassRegex = new RegExp("(^|\\s)rangySelectionBoundary(\\s|$)"),

// clear text from additional elements after paste
/<!--StartFragment-->([\s\S]*?)<!--EndFragment-->/i
/,\^\$\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}\>\<\@\%\&\#\;
punctuationRegExp-\_\~\u061F\u060C\u061B\u0001-\u001F\u0080-\u00B6\u00B8-\u00BF\u2000-\u200A\u200C-\u266F\u2E00-\u2E7F /
blockElementsRegex /^(aside|br|img|caption|button|address|blockquote|body|center|dir|div|dl|fieldset|form|h[1-6]|hr|isindex|menu|noframes|noscript|ol|p|pre|table|ul|dd|dt|frameset|li|tbody|td|tfoot|th|thead|tr|html|select|option|sup|sub|input)$/i
specialCharactersRegex new RegExp( "[" + String.fromCharCode(8203) + String.fromCharCode(65279) + "]+"
/,/g
new RegExp('^(' + self.options[optionName].value + ')$', 'i');
wordBoundaryRegex new RegExp('[' + /.\s\xA0/.source + this.options['punctuationRegExp'].value.source + ']')
punctuationRegExp new RegExp(this.options['punctuationRegExp'].value.source + this.options['customPunctuation'].value)

wordRegex: /[^\s]+/g
/&/gi

/\ufeff/g, '' ) // remove zero-width space added by rangy
/\u0002/g, '' ); // fix for FireFox (without it FF shows "Start of text" character);



/\ufeff/g

/__%N%__/g
/__%R%__/g

Cookie new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)")
*/
// /^\/*/
/*
/([a-z]+)(?:-([a-z]+))?/
/scaytDebug\b/
/\W/
/((^|%>)[^\t]*)'/g
/\t=(.*?)%>/g

UTILS
new RegExp( String.fromCharCode(160), 'g' )
new RegExp( '['+punctuation.source+']', 'g' )
(/([\.\-\']{2,})/g, '#$1#').replace(/#[\.\-\']|[\.\-\']#/g
new RegExp( ' [\-\'\.]|[\-\'\.] ', 'g' )
new RegExp( '^[\-\'\.]|[\-\'\.]$', 'g' )
/[\r\n(\r\n)\<\>\\\/\=\"]/g
/^\//

/:/
/^\//
new RegExp( String.fromCharCode(160), 'g' )
new RegExp( String.fromCharCode(65279), 'g' )
new RegExp( String.fromCharCode(8203), 'g' )
new RegExp( String.fromCharCode(8204), 'g' )
/UTILS

/(^|.*[\\\/])ckscayt.js(?:\?.*)?$/i
*/
// /^.*?:\/\/[^\/]*/
/*
/^[^\?]*\/(?:)/
/undo\|?|redo\|?/g
/cut\|?|copy\|?|paste\|?/g
/(^|.*[\\\/])customscayt.js(?:\?.*)?$/i */
// /^.*?:\/\/[^\/]*/
/*
 /^[^\?]*\/(?:)/
 /(^|.*[\\\/])scayt.js(?:\?.*)?$/i
/(^|.*[\\\/])tinymcescayt.js(?:\?.*)?$/i
*/
// /^\d(\.\d*)*/
/*
/https?:/
/^\/\//
/:/
/^\//
/[ ,]/
/\s?[\|]+/gi
/\s?[\|]+/g
*/
   /*
						\xA0 - 160 char code which represents non breaking space in IE

						/^[\s\xA0]+(?=[A-ZА-Я]{1})/g
						- first space
						- then after space need to be uppercase letter

						/[^A-ZА-Яа-яa-zЁё0-9_]/g
						- @TODO - ??? may be strings that starts like "Sasfsf s"

						/\b/
						- get last sentence at the end of control's text
					*/