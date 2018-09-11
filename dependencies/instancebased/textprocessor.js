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

            RegularsManager.textPunctuation.store('punctuationRegExp');
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
                    punctuationRegExp = RegularsManager.punctuationRegExp;

                text = RegularsManager.HtmlSpaceSymbol.compositionGraph([
                    punctuationRegExp,
                    RegularsManager.EOL,
                    RegularsManager.wrap( this.appInstance.getOption('customPunctuation') )
                ]).g().set().replace(text, ' ');

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
                return RegularsManager.specialCharacters
                    .set().g().replace(text, '');
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
	if(typeof WEBSPELLCHECKER !== 'undefined' && !('Connection' in WEBSPELLCHECKER)) {init(WEBSPELLCHECKER);}
})();