// typechecker.js
/**
 * @fileoverview Static Module. WEBSPELLCHECKER TypeChecker module.
 */
(function() {
	function init(Namespace) {
       var TypeChecker = {
            isString: function(value) {
                return typeof value === 'string';
            },
            notEmptyString: function(value) {
                return value !== '' && TypeChecker.isString(value);
            },
            isArray: function(value) {
                return {}.toString.call(value) === '[object Array]';
            },
            // Checks if the object is a hash, which is equivalent to an object that
            // is neither an array nor a function.
            isHash: function(value) {
                return TypeChecker.isObject(value) && !TypeChecker.isArray(value) && !TypeChecker.isFunction(value);
            },
                // Checks if the value is a boolean
            isBoolean: function(value) {
                return typeof value === 'boolean';
            },// Uses the `Object` function to check if the given argument is an object.
            isObject: function(obj) {
                return obj === Object(obj);
            },
            // Simply checks if the object is an instance of a date
            isDate: function(obj) {
                return obj instanceof Date;
            },
            // Returns false if the object is `null` of `undefined`
            isDefined: function(obj) {
                return obj !== null && obj !== undefined;
            },
            isEmpty: function(value) {
                var attr;

                // Null and undefined are empty
                if (!TypeChecker.isDefined(value)) {
                    return true;
                }

                // functions are non empty
                if (TypeChecker.isFunction(value)) {
                    return false;
                }

                // Whitespace only strings are empty
                if (TypeChecker.isString(value)) {
                    return TypeChecker.EMPTY_STRING_REGEXP.test(value);
                }

                // For arrays we use the length property
                if (TypeChecker.isArray(value)) {
                    return value.length === 0;
                }

                // Dates have no attributes but aren't empty
                if (TypeChecker.isDate(value)) {
                    return false;
                }

                // If we find at least one property we consider it non empty
                if (TypeChecker.isObject(value)) {
                    for (attr in value) {
                        return false;
                    }
                    
                    return true;
                }

                return false;
            },
            // Returns false if the object is not a function
            isFunction: function(value) {
                return typeof value === 'function';
            },
            // A simple check to verify that the value is an integer. Uses `isNumber`
            // and a simple modulo check.
            isInteger: function(value) {
                return TypeChecker.isNumber(value) && value % 1 === 0;
            },
            // Checks if the value is a number. TypeChecker function does not consider NaN a
            // number like many other `isNumber` functions do.
            isNumber: function(value) {
                return typeof value === 'number' && !isNaN(value);
            },
            // Checks if the value is a number. TypeChecker function does not consider NaN a
            // number like many other `isNumber` functions do.
            isPositive: function(value) {
                return typeof value === 'number' && value >= 0;
            }
        };

        Namespace.Utils = Namespace.Utils || {};
        Namespace.Utils.TypeChecker = TypeChecker;
    }

    if (typeof window === 'undefined') {
        module.exports = init;
    }

    if (typeof WEBSPELLCHECKER !== 'undefined') {
        init(WEBSPELLCHECKER);
    }
})();
