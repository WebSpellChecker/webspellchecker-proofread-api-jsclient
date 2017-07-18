// RegularsManager.js
/**
 * @fileoverview Static Module. RegularsManager of WEBSPELLCHECKER
 */
(function(){
    'use strict';
	function init( Namespace ) {

         function RegularType(name, sourse, flags) {
            this.name = name;
            this.flags = flags || '';
            this.sourse = sourse;
            this.string = '';
            var init = function(string) {
                return this.setString(string);
            };
            return init.bind(this);
        }

        RegularType.prototype = {
            _wrapSymbol: '#',
            _getRegExp: function() {
                 return new RegExp(this.sourse, this.flags);
            },
            _combain: function(options) {
                var separator = options.separator || '';
                var nameConcatinator = options.nameConcatinator || '&';
                var sourse = this.sourse + separator + options.sourse;
                var name = options.compositionName || (this.name + options.nameConcatinator + options.name);
                var combainRegType = new RegularType(name, sourse)(this.string);
                combainRegType.addFlags(options.flags + this.flags);
                return combainRegType;
            },
            _setString: function(string) {
                var clone = this.clone();
                clone.string = string;
                return clone;
            },
            clone: function() {
                return Object.assign({}, this);
            },
            getSring: function() {
                return this.string;
            },
            addFlags: function(flags) {
                var clone = this.clone(),
                    flagsArr = flags.split();
                flagsArr.forEach(function(flag) {
                    if( clone.flags.indexOf(flag) === -1 ) {
                        clone.flags += flag;
                    }
                }, this);
                return clone;
            },
            g: function() {
                return this.clone().addFlags('g');
            },
            i: function() {
                return this.clone().addFlags('i');
            },
            set: function() {
                var clone = this.clone();
                clone.sourse = '[' + clone.sourse + ']';
                return clone;
            },
            start: function() {
                var clone = this.clone();
                clone.sourse = '^' + clone.sourse;
                return clone;
            },
            end: function() {
                var clone = this.clone();
                clone.sourse += '$';
                return clone;
            },
            split: function() {
                return this.string.split( this._getRegExp() );
            },
            replace: function(subStr) {
                this.string.replace(this._getRegExp(), subStr);
                return this;
            },
            replaceWrapped: function(subStr, wrapSymbol) {
                wrapSymbol = wrapSymbol || this._wrapSymbol;
                var clone = this.clone();
                clone.sourse = wrapSymbol + clone.sourse + wrapSymbol;
                clone.replace(clone.string, subStr);
                return clone;
            },
            replaceLeftWrapped: function(wrapSymbol, subStr) {
                wrapSymbol = wrapSymbol || this._wrapSymbol;
                var clone = this.clone();
                clone.sourse = wrapSymbol + clone.sourse;
                clone.replace(clone.string, subStr);
                return clone;
            },
            replaceRightWrapped: function(wrapSymbol, subStr) {
                wrapSymbol = wrapSymbol || this._wrapSymbol;
                var clone = this.clone();
                clone.sourse = clone.sourse + wrapSymbol;
                clone.replace(clone.string, subStr);
                return clone;
            },
            wrapInclude: function(wrapSymbol) {
                wrapSymbol = wrapSymbol || this._wrapSymbol;
                this.replace(this.string, wrapSymbol+"$1"+wrapSymbol);
                return this;
            },
            or: function(regExpObject, compositionName) {
                return this._combain({
                    compositionName: compositionName,
                    flags: regExpObject.flags,
                    sourse: regExpObject.sourse,
                    separator: '|',
                    nameConcatinator: '|'
                });
            },
            composition: function(regExpObject, compositionName) {
                var flags = regExpObject.flags + this.flags,
                    name = compositionName || this.name + '&' + regExpObject.name,
                    sourse = regExpObject.sourse + this.sourse;
                
                return this._combain({
                    compositionName: compositionName,
                    flags: regExpObject.flags,
                    sourse: regExpObject.sourse
                });
            },
            compositionGraph: function(listOfRegExpObjects, compositionName) {
                var compositionObj;
                listOfRegExpObjects.forEach(function(element) {
                    compositionObj = (compositionObj) ? compositionObj.composition(element) : element;
                }, this);
                compositionObj.name = compositionName || compositionObj.name;
                return compositionObj;
            }
        };

        var RegularsSourses = {
            space: "xA0\s",
            dot: '\.',
            digits : '[0-9]',
            //Punctuations
            HtmlSpaceSymbol:  String.fromCharCode(160),
            // \u061F - Arabic question mark, \u060C - Arabic comma, \u061B - Arabic semicolon
            textPunctuation: ",\^\$\*\+\?\=\!\:\|\\\/\(\)\[\]\{\}\>\<\@\%\&\#\;\_\~\u061F\u060C\u061B\u0001-\u001F\u0080-\u00B6\u00B8-\u00BF\u2000-\u200A\u200C-\u266F\u2E00-\u2E7F",
            situationalSeparators: "\.\-\'",
            EOL: '\r\n(\r\n)\"',
            specialCharacters: String.fromCharCode(8203) + String.fromCharCode(65279),            
            ip: '/^((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))*$/',
            twoAndMore: '{2,}'
        };

        var RegularsManager = {};
        
        for(var k in RegularsSourses){
            RegularsManager[k] = new RegularType(k, RegularsSourses[k]);
        }
        
        Namespace.RegularsManager = RegularsManager;
    }
    (typeof WEBSPELLCHECKER !== 'undefined') ? init(WEBSPELLCHECKER) : module.exports = init;

})();