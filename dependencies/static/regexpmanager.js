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

        var Regularssources = {
            space: "[\\s\\xA0]",
            dot: '\\.',
            digits : '[0-9]',
            //Punctuations
            HtmlSpaceSymbol:  String.fromCharCode(160),
            // \u061F - Arabic question mark, \u060C - Arabic comma, \u061B - Arabic semicolon
            textPunctuation: ",\"\^\$\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}\>\<\@\%\&\#\;\_\~\u061F\u060C\u061B\u0001-\u001F\u0080-\u00B6\u00B8-\u00BF\u2000-\u200A\u200C-\u266F\u2E00-\u2E7F",
            situationalSeparators: "\\.\\-\\'",
            EOL: '[\r\n(\r\n)]',
            specialCharacters: String.fromCharCode(8203) + String.fromCharCode(65279),            
            ip: '/^((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))*$/',
            twoAndMore: '{2,}'
        };

        function RegularType(name, source, flags) {
            this.name = name;
            this.flags = flags || '';
            this.source = source;
            this.string = '';
        }

        RegularType.prototype = {
            _wrapSymbol: '#',
            _getRegExp: function() {
                 return new RegExp(this.source, this.flags);
            },
            _combain: function(options) {
                var regExpObject = options.regExpObject;
                var separator = options.separator || '';
                var nameConcatinator = options.nameConcatinator || '&';
                var source = this.source + separator + regExpObject.source;
                var name = options.compositionName || (this.name + options.nameConcatinator + regExpObject.name);
                var combainRegType = new RegularType(name, source).init(this.string);
                combainRegType = combainRegType.addFlags(regExpObject.flags + this.flags);
                return combainRegType;
            },
            _replaceSource: function(subStr, source) {
                return this._updateSource(source).replace(subStr);
            },
            _updateSource: function(source) {
                var clone = this.clone();
                clone.source = source;
                return clone;
            },
            init: function(string) {
                return this.setString(string);
            },
            clone: function() {
                var clone = Object.create(RegularType.prototype);
                return Object.assign(clone, this) ;
            },
            setString: function(string) {
                var clone = this.clone();
                clone.string = string;
                return clone;
            },
            getString: function() {
                return this.string;
            },
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
            g: function() {
                return this.addFlags('g');
            },
            i: function() {
                return this.addFlags('i');
            },
            set: function() {
                var source = removeSetBrackets(this.source);
                return this._updateSource('[' + source + ']');
            },
            group: function() {
                return this._updateSource('(' + this.source + ')');
            },
            start: function() {
                return this._updateSource('^' + this.source );
            },
            end: function() {
                return this._updateSource(this.source + '$');
            },
            split: function() {
                return this.string.split( this._getRegExp() );
            },
            replace: function(subStr) {
                var clone = this.clone();
                clone.string = clone.string.replace(this._getRegExp(), subStr);
                return clone;
            },
            replaceLeftWrapped: function(wrapSymbol, subStr) {
                wrapSymbol = wrapSymbol || this._wrapSymbol;
                return this._replaceSource(subStr, wrapSymbol + this.source);
            },
            replaceRightWrapped: function(wrapSymbol, subStr) {
                wrapSymbol = wrapSymbol || this._wrapSymbol;
                return this._replaceSource(subStr, this.source + wrapSymbol);
            },
            wrapInclude: function(wrapSymbol) {
                wrapSymbol = wrapSymbol || this._wrapSymbol;
                return this.group().replace(wrapSymbol+"$1"+wrapSymbol);
            },
            or: function(regExpObject, compositionName) {
                return this._combain({
                    compositionName: compositionName,
                    regExpObject: regExpObject,
                    separator: '|',
                    nameConcatinator: '|'
                });
            },
            composition: function(regExpObject, compositionName) {
                return this._combain({
                    regExpObject: regExpObject,
                    separator: '',
                    nameConcatinator: '&',
                    compositionName: compositionName
                });
            },
            compositionGraph: function(listOfRegExpObjects, compositionName) {
                var compositionObj = (this instanceof RegularType) ? this : undefined;
                listOfRegExpObjects.forEach(function(element) {
                    compositionObj = (compositionObj) ? compositionObj.composition(element) : element;
                }, this);
                compositionObj.name = compositionName || compositionObj.name;
                return compositionObj;
            }
        };

     

        var RegularsManager = {};
        
        for(var k in Regularssources){
            RegularsManager[k] = new RegularType(k, Regularssources[k]);
        }
        
        Namespace.RegularsManager = RegularsManager;
    }
    (typeof WEBSPELLCHECKER !== 'undefined') ? init(WEBSPELLCHECKER) : module.exports = init;

})();