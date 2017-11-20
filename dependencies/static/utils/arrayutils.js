// arrayutils.js
/**
 * @fileoverview Static Module. WEBSPELLCHECKER ArrayUtils module.
 */
(function() {
    function init(Namespace) {
        'use strict';

        var ArrayUtils = {
            arrayUnique: function( array, comparisonFunc ) {
                var a = array.concat();
                var comparisonFunc = comparisonFunc || function(a, b) {
                    return a === b;
                };

                for (var i = 0; i < a.length; i++) {
                    for (var j = i + 1; j < a.length; j++) {
                        if (comparisonFunc(a[i], a[j])) {
                            a.splice(j--, 1);
                        }
                    }
                }

                return a;
            },

            /**
            * Transform Array-like arguments object to common array.
            * @param {Arguments} args - Array-like object
            */
            argumentsToArray: function(args) {
                var len = args.length,
                    resultArray = new Array(len);

                for (var i = 0; i < len; i++) {
                    resultArray[i] = args[i];
                }

                return resultArray;
            },

            /**
            * Create object based on provided arrays
            * @param {Array} keys - array with keys of result object
            * @param {Array} values - array with values of result object
            */
            zipArraysToObject: function(keysArr, valuesArr) {
                var resultObject = {};

                for (var i = 0; i < keysArr.length; i++) {
                    resultObject[keysArr[i]] = valuesArr[i];
                }

                return resultObject;
            },

            /**
            * Compare two arrays of strings and return result of their difference
            * @param {Array.<String>} base - array of strings which will be compared to new array
            * @param {Array.<String>} comparable - new array
            * @returns {Array.<String>} - returned difference array
            */
            diffArrays: function( base, comparable ) {
                var result = [],
                    comparableLength = comparable.length; // difference

                for (var i = 0; i < comparableLength; i++) {
                    if ( this.indexOf(base, comparable[i]) < 0 ) {
                        result.push(comparable[i]);
                    }
                }

                return result;
            }
        };

        Namespace.Utils = Namespace.Utils || {};
        Namespace.Utils.ArrayUtils = ArrayUtils;
    }

    if (typeof window === 'undefined') {
        module.exports = init;
    }

    if (typeof WEBSPELLCHECKER !== 'undefined') {
        init(WEBSPELLCHECKER);
    }
})();
