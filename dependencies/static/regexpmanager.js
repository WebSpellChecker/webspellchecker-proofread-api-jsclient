// RegularsManager.js
/**
 * @fileoverview Static Module. RegularsManager of WEBSPELLCHECKER
 */
(function(){
    'use strict';
	function init( Namespace ) {
        function removeSetBrackets(string) {
            for(var i = 0; i < string.length; i += 1) {
                if(string[i - 1] !== '\\' && (string[i] === '[' || string[i] === ']')) {
                    string = string.substring(0, i) + string.substring(i + 1);
                }
            }

            return string;
        }

        /**
         * Constructor for regExp type.
         * List of regulars sources stored in regularssources.js
         * @constructor
         * 
         * @param {String} name - type name.
         * @param {String} source -string source of regular expression.
         * @param {String} flags -regExp flags (g,i etc.).
         */
        function RegularType(name, source, flags) {
            this.name = name;
            this.flags = flags || '';
            this.source = source;
            this.string = '';
        }

        RegularType.prototype = {
            _wrapSymbol: '#',
            /**
             * Create RegExp from sources.
             * 
             * @return {RegExp} RegExp.
             */
            _getRegExp: function() {
                 return new RegExp(this.source, this.flags);
            },
            /**
             * Combine provided regularType with current.
             * 
             * @param {Object} options - Combine data Object.
             * @param {Object} options.regExpObject - Instance of RegularType.
             * @param {String} options.separator - string element what separate two regular sources.
             * @param {String} options.nameSeparator - string element what separate two names of regular types.
             * @param {String} options.compositionName - Name of result composition.
             *      If not specified name generate automatically based on Regular Type names and name separator parameter.
             * 
             * @return {Object} Combined regular types.
             */
            _combine: function(options) {
                var regExpObject = options.regExpObject;
                if(regExpObject instanceof RegularType === false) {
                    throw new Error(regExpObject.name + ' should be instance of RegularType constructor.');
                }
                var separator = options.separator || '';
                var nameSeparator = options.nameSeparator || '&';
                var source = this.source + separator + regExpObject.source;
                var name = options.compositionName || (this.name + options.nameSeparator + regExpObject.name);
                var combainRegType = new RegularType(name, source).init(this.string);
                combainRegType = combainRegType.addFlags(regExpObject.flags + this.flags);

                return combainRegType;
            },
            /**
             * The composition of the _updateSource and replace methods.
             * 
             * @param {String} subStr - The string that replaces the substring specified by source parameter.
             * @param {String} source - New source for current regular type.
             * 
             * @return {Object} new regular type based on provided source and with changed string.
             */
            _replaceWithAnotherSource: function(subStr, source) {
                var clone = this._updateSource(source).replace(subStr);
                clone.source = this.source;
                return clone;
            },
            /**
             * Method what reassign source parameter.
             * 
             * @param {String} source - Regular type source.
             * 
             * @return {Object} new regular type with new source.
             */
            _updateSource: function(source) {
                var clone = this.clone();
                clone.source = source;
                return clone;
            },
            /**
             * Method what set string for processing to current regular type.
             * 
             * @param {String} string - String what will process in current regular type.
             * 
             * @return {Object} new regular with specified string.
             */
            init: function(string) {
                 var clone = this.clone();
                 clone.string = string;
                 return clone;
            },
            /**
             * Method what create new regular type based on current.
             * 
             * @return {Object} clone of current regular type.
             */
            clone: function() {
                var clone = Object.create(RegularType.prototype);
                return Object.assign(clone, this) ;
            },
            /**
             * Return the string field of current regular type.
             * 
             * @return {String} current string.
             */
            getString: function() {
                return this.string;
            },
            /**
             * Add RegEx flags if it not already setted.
             * @param {String} flags - String with RegExp flags 'gi'| 'g' etc.
             * 
             * @return {Object} clone of current regular type.
             */
            addFlags: function(flags) {
                var clone = this.clone(),
                    flagsArr = flags.split('');
                flagsArr.forEach(function(flag) {
                    if( clone.flags.indexOf(flag) === -1 ) {
                        clone.flags += flag;
                    }
                }, this);
                return clone;
            },
            /**
             * Add 'g' RegEx flag if it not already setted.
             * 
             * @return {Object} clone of current regular type.
             */
            g: function() {
                return this.addFlags('g');
            },
            /**
             * Add 'i' RegEx flag if it not already setted.
             * 
             * @return {Object} clone of current regular type.
             */
            i: function() {
                return this.addFlags('i');
            },
            /**
             * Transformation of regular type source to:
             * a character set. Matches any one of the enclosed characters. 
             *
             * @return {Object} clone of current regular type.
             */
            set: function() {
                var source = removeSetBrackets(this.source);
                return this._updateSource('[' + source + ']');
            },
            /**
             * Transformation of regular type source to:
             * a capturing groups. 
             *
             * @return {Object} clone of current regular type.
             */
            group: function() {
                return this._updateSource('(' + this.source + ')');
            },
            /**
             * Transformation of regular type source to:
             * a matches beginning of input.
             *
             * @return {Object} clone of current regular type.
             */
            start: function() {
                return this._updateSource('^' + this.source );
            },
            /**
             * Transformation of regular type source to:
             * a matches end of input.
             *
             * @return {Object} clone of current regular type.
             */
            end: function() {
                return this._updateSource(this.source + '$');
            },
            /**
             * Transformation of regular type source to:
             * a matches the preceding item x 0 or more times.
             *
             * @return {Object} clone of current regular type.
             */
            onePlus: function() {
                return this._updateSource(this.source + '+');
            },
            /**
             * Transformation of regular type source to:
             * a matches x only if x is followed by y.
             *
             * @return {Object} clone of current regular type.
             */
            lookahead: function() {
                return this.group( this._updateSource('?=' + this.source) );
            },
            /**
             * Split string by current regular type.
             * @param {String} string - splitted string;
             *
             * @return {Array} clone of current regular type.
             */
            split: function(string) {
                return this.string.split( this._getRegExp() );
            },
            /**
             * Clone regular type and change string.
             * @param {String} subStr - The String that replaces the substring specified by regular type.
             *
             * @return {Array}
             */
            replace: function(subStr) {
                var clone = this.clone();
                clone.string = clone.string.replace(this._getRegExp(), subStr);
                return clone;
            },
            /**
             * Replace regular type with provided left symbol.
             * @param {String} wrapSymbol - String what will added to sources left.
             * @param {String} subStr - The String that replaces the substring specified by regular type.
             * 
             * @return {Array} clone of current regular type.
             */
            replaceLeftWrapped: function(wrapSymbol, subStr) {
                wrapSymbol = wrapSymbol || this._wrapSymbol;
                return this._replaceWithAnotherSource(subStr, wrapSymbol + this.source);
            },
            /**
             * Replace regular type with provided right symbol.
             * @param {String} wrapSymbol - String what will added to sources right.
             * @param {String} subStr - The String that replaces the substring specified by regular type.
             * 
             * @return {Array} clone of current regular type.
             */
            replaceRightWrapped: function(wrapSymbol, subStr) {
                wrapSymbol = wrapSymbol || this._wrapSymbol;
                return this._replaceWithAnotherSource(subStr, this.source + wrapSymbol);
            },
            /**
             * Wrap regular includes in this.string by wrapSymbols.
             * @param {String} wrapSymbol - What wrap include.
             * 
             * @return {Array} clone of current regular type.
             */
            wrapInclude: function(wrapSymbol) {
                wrapSymbol = wrapSymbol || this._wrapSymbol;
                return this.group().replace(wrapSymbol+"$1"+wrapSymbol);
            },
            /**
             * Add provided regular type to current.
             * @param {Object} regExpObject - Instance of RegularType.
             * @param {String} compositionName - Name of result composition.
             *      If not specified name generate automatically from regular types combine by &.
             * 
             * @return {Object} Combined regular types.
             */
            composition: function(regExpObject, compositionName) {
                return this._combine({
                    regExpObject: regExpObject,
                    separator: '',
                    nameSeparator: '&',
                    compositionName: compositionName
                });
            },
            /**
             * "Either" operation between provided regular type with current.
             * @param {Object} regExpObject - Instance of RegularType.
             * @param {String} compositionName - Name of result composition.
             *      If not specified name generate automatically from regular types combine by |.
             * 
             * @return {Object} Combined regular types.
             */
            or: function(regExpObject, compositionName) {
                return this._combine({
                    compositionName: compositionName,
                    regExpObject: regExpObject,
                    separator: '|',
                    nameSeparator: '|'
                });
            },
            /**
             * Add list of regular types to current.
             * @param {Array} listOfRegExpObjects - List of regular types instances.
             * @param {String} compositionName - Name of result composition.
             *      If not specified name generate automatically from regular types combine by &.
             * 
             * @return {Object} Combined regular types.
             */
            compositionGraph: function(listOfRegExpObjects, compositionName) {
                var compositionObj = (this instanceof RegularType) ? this : undefined;
                listOfRegExpObjects.forEach(function(element) {
                    compositionObj = (compositionObj) ? compositionObj.composition(element) : element;
                }, this);
                compositionObj.name = compositionName || compositionObj.name;
                return compositionObj;
            }
        };

        /**
         * @exports WEBSPELLCHECKER.RegularsManager
         */
        var RegularsManager = {
                /**
                 * Add regular type to RegularsManager.
                 * 
                 * @param {String} name - Name of regular type.
                 * @param {String} source - Regular expression source. 
                 */
                addRegularType: function(name, source) {
                    this[name] = new RegularType(name, source);
                }
            },
            RegularsSources = Namespace.RegularsSources;

        for(var k in RegularsSources){
            RegularsManager.addRegularType(k, RegularsSources[k]);
        }

        Namespace.RegularsManager = RegularsManager;
    }
    if(typeof window === 'undefined') {module.exports = init;}
	if(typeof WEBSPELLCHECKER !== 'undefined') {init(WEBSPELLCHECKER);}

})();