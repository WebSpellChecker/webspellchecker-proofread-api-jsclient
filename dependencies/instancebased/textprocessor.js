// TextProcessor.js
/**
 * @fileoverview Static Module. TextProcessor.
 */
(function(){
    'use strict';
	function init( Namespace ) {


            // text = text.replace( new RegExp( String.fromCharCode(160), 'g' ), ' ' );

			// text = text.replace( new RegExp( '['+punctuation.source+']', 'g' ), ' ' );

			// text = text.replace(/([\.\-\']{2,})/g, '#$1#').replace(/#[\.\-\']|[\.\-\']#/g, ' '); // 
			// text = text.replace( new RegExp( ' [\-\'\.]|[\-\'\.] ', 'g' ), '  ' ); // except cases
			// text = text.replace( new RegExp( '^[\-\'\.]|[\-\'\.]$', 'g' ), ' ' ); // except cases

            // text = text.replace( /[\r\n(\r\n)\<\>\\\/\=\"]/g, ' ' );
            
            // text = text.replace( /*REG_REPLACE*/new RegExp( String.fromCharCode(160), 'g' ), ' ' );
        //wordBoundary
        var RegularsManager = Namespace.RegularsManager;
        function TextProcessor(moduleId, appInstance) {
            this.moduleId = moduleId;
            this.appInstance = appInstance;
        }

        TextProcessor.prototype = {
            replaceSpaces: function() {},
            removeSepatators(text) {
                var _situationalSepSetGlob;
                text = RegularsManager.HtmlSpaceSymbol.compositionGraph([
                    RegularsManager.textPunctuation,
                    RegularsManager.EOL
                ]).g().set()
                .init(text)
                .replace(' ')
                .getString();

                _situationalSepSetGlob = RegularsManager.situationalSeparators
                    .set().g();
                
                text = _situationalSepSetGlob
                    .composition(RegularsManager.twoAndMore)
                    .init(text)
                    .wrapInclude("#")
                    .getString();
                
                text = _situationalSepSetGlob
                    .init(text)
                    .replaceLeftWrapped('#', ' ')
                    .replaceRightWrapped('#', ' ')
                    .getString();

                text = _situationalSepSetGlob
                    .init(text)
                    .replaceRightWrapped(' ', '  ')
                    .replaceLeftWrapped(' ', '  ')
                    .start().or( _situationalSepSetGlob.end() )
                    .replace(' ')
                    .getString();
                
                text = RegularsManager.EOL.set().g()
                    .init(text)
                    .replace(' ')
                    .getString();

                return text;
            },
            removeSpecialCharacters(text) {
                return RegularsManager.specialCharacters.
                    init(text).g().replace('').getString();
            },
            getWordsFromText: function(text) {
                var minWordLength = 4,//this.appInstance.getOption('minWordLength'),
                    words, wordsCollection;
                // get correct minWordLength option (for some languages we need to apply restriction that does not allow user to configure minWordLength option. E.g.: th_TH, ko_KR)
                text = this.removeSepatators(text);
                text = this.removeSpecialCharacters(text);

                // for Thai we need to keep word with length > 1
                wordsCollection = RegularsManager.space
                    .init(text)    
                    .split()
                    .filter(function(word) {
                        return (word !== '' && word.length >= minWordLength ) ? true : false;
                    });

                return wordsCollection;
            },
            getSentencesFromString: function() {

            }
            
        };

        Namespace.TextProcessor = TextProcessor;
    }
    (typeof WEBSPELLCHECKER !== 'undefined') ? init(WEBSPELLCHECKER) : module.exports = init;

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