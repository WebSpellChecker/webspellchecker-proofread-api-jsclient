// OptionsManager.js
/**
 * @fileoverview Static Module. OptionsManager
 */
(function() {
	function init( Namespace ) {
        var TypeChecker = Namespace.Utils.TypeChecker,
            ArrayUtils = Namespace.Utils.ArrayUtils, validators;

        /**
         * Constructor for option type.
         * @constructor
         *
         * @param {String} name - type name.
         * @param {Function} validate - Parameter validation checker.
         * @private
         */
        function OptionType(typeData) {
            this.name = typeData.name;
            this.validate = typeData.validate;
            this.erroMessageTemplate = typeData.erroMessageTemplate ||
                'Parameter %optionName% should have a type - ' + this.name + '.';
        }

        OptionType.prototype = {
            constructor: OptionType,
            createErrorMessage: function(optionName) {
                return this.erroMessageTemplate.replace(/%optionName%/g, optionName);
            }
        }
        /**
         * Constructor for errors Object.
         * This object acomulated errors what occur during validation parameters.
         * @constructor
         *
         * @private
         */
        function ErrorsObject() {
            this.critical = false;
            this.count = 0;
            this.reports = [];
            this.addError = function(error) {
                if (error.critical && this.critical === false) {
                    this.critical = true;
                }

                this.reports.push(error);
                this.count += 1;
            };
        }

        function OptionsObject() {
            this._validatedFields = [];
        }

        function deepClone(data) {
            var res;
            if( TypeChecker.isHash(data) ) {
                res = {};
                for(var k in data) {
                    res[k] = deepClone(data[k]);
                }
            } else if( TypeChecker.isArray(data) ) {
                res = data.slice(0);
                for(var i = 0; i < res.length; i += 1) {
                    res[i] = deepClone(res[i]);
                }
            } else {
                res = data;
            }

            return res;
        }

        OptionsObject.prototype = {
            constructor: OptionsObject,
            addOption: function(option) {
                var name = option.name;

                if ( !this._validatedFields.includes(name) ) {
                    this[name] = this._createOptionValue(option);

                    if (typeof this[name] !== 'undefined') {
                        this._validatedFields.push(name);
                    }
                }
            },
            /**
             * Method return option value based on option parameters.
             * @memberof WEBSPELLCHECKER.OptionsManager#
             *
             * @param {Object} optionData - Object with option parameters.
             * @param {String} optionData.name - Option name.
             * @param {*} optionData.value - Option user value.
             * @param {Object} optionData.template - Object with object info.
             * @param {Function} optionData.errorHandler - Problem Handler. Receive object with error info.
             *
             * @returns {*} - Option value.
             * @private
             */
            _createOptionValue: function (optionData) {
                var optionValue = optionData.value,
                    optionTemplate = optionData.template,
                    errorReport = {},
                    optionName = optionData.name,
                    optionErrorHandler = optionData.errorHandler,
                    validated,
                    defaultValue = deepClone(optionTemplate.defaultValue);

                if (optionValue === undefined && !optionTemplate.required) {
                    return defaultValue;
                }

                validated = optionTemplate.type.validate(optionValue);

                if (validated) {
                    return optionValue;
                }

                errorReport.critical = optionTemplate.required || false;
                errorReport.optionName = optionName;
                errorReport.message = optionTemplate.type.createErrorMessage(optionName);

                optionErrorHandler(errorReport);

                return defaultValue;
            },
        };

        function OptionsTemplate(template) {
            Object.assign(this, template);
        }

        OptionsTemplate.prototype = {
            constructor: OptionsTemplate,
            getDefaultValue: function(optionName) {
                return this[optionName].defaultValue;
            },
            setDefaults: function(defaults) {
                for (var k in defaults) {
                    this[k].defaultValue = defaults[k];
                }
            }
        };

        /**
         * @exports WEBSPELLCHECKER.OptionsManager
         */
        var OptionsManager = {
            optionTypes: {},
            optionsTemplate: {},
            /**
             * List of Validation rules.
             * @memberof WEBSPELLCHECKER.OptionsManager#
             */
            optionsValidators: {
                array: TypeChecker.isArray,
                boolean: TypeChecker.isBoolean,
                date: TypeChecker.isDate,
                defined: TypeChecker.isDefined,
                empty: TypeChecker.isEmpty,
                'function': TypeChecker.isFunction,
                hash: TypeChecker.isHash,
                integer: TypeChecker.isInteger,
                positive: TypeChecker.isPositive,
                number: TypeChecker.isNumber,
                object: TypeChecker.isObject,
                string: TypeChecker.isString,
                urlProtocol: function(value) {
                    return value === 'http' || value === 'https';
                },
                urlHost:function(value) {
                    return TypeChecker.notEmptyString(value); // && Regular test ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=
                },
                urlPort: function(value) {
                    if ( TypeChecker.isNumber(value) ) {
                        return TypeChecker.isInteger(value);
                    } else if (TypeChecker.isString) {
                        return TypeChecker.isInteger( parseFloat(value) );
                    }

                    return false;
                },
                urlPath: function(value) {
                    return TypeChecker.notEmptyString(value); // && Regular test ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=
                },
                // Type when we always want use default value
                defaultValue: function() {
                    return false;
                }
            },
            /**
             * Method what porocces client options.
             * @memberof WEBSPELLCHECKER.OptionsManager#
             *
             * @param {Object} clientOptions - Options what should be processed.
             * @param {Object} optionsTemplate - Validation and another information for clientOptions options.
             * @param {Object} errorHandler - Error callback if we have a problem with options creating.
             *
             * @returns {Object} - processed options.
             * @private
             */
            createOptions: function(clientOptions, template, errorsHandler) {
                var option, valid, options, optionsTemplate,
                    errorsObject = new ErrorsObject();

                clientOptions = clientOptions || {};

                if (clientOptions instanceof OptionsObject === true) {
                    options = clientOptions;
                } else {
                    options = new OptionsObject();
                }

                if ( TypeChecker.isString(template) ) {
                    optionsTemplate = this.importOptionsTemplate(template);
                } else if ( TypeChecker.isObject(template) ) {
                    if (template instanceof OptionsTemplate === true) {
                        optionsTemplate = template;
                    } else {
                        optionsTemplate = new OptionsTemplate(template);
                    }
                }

                for (var k in optionsTemplate) {
                    if ( optionsTemplate.hasOwnProperty(k) === false ) {
                        continue;
                    }

                    if (optionsTemplate[k].type instanceof OptionType === false) {
                        throw new Error(k + ' template "type" parameter should be instance of OptionsManager.OptionType constructor.');
                    }

                    options.addOption({
                        name: k,
                        value: clientOptions[k],
                        template: optionsTemplate[k],
                        errorHandler: function(error) {
                            errorsObject.addError(error);
                        }
                    });
                }

                if (errorsHandler && errorsObject.count > 0) {
                    errorsHandler(errorsObject);
                }

                return options;
            },
            /**
             * Add new option type.
             * @memberof WEBSPELLCHECKER.OptionsManager#
             *
             * @param {Object} type - New type info.
             * @param {String} type.name - Type name.
             * @param {Function} type.validate - Validation rules for current type.
             * @private
             */
            extendOptionTypes: function(type) {
                if ( TypeChecker.isArray(type) ) {
                    type.forEach(OptionsManager.extendOptionTypes.bind(this));
                }

                if ( !type.name || !TypeChecker.isFunction(type.validate) ) {
                    return false;
                }

                if (!this.optionTypes[type.name]) {
                    this.optionTypes[type.name] = new OptionType(type);
                }
            },
            exportOptionsTemplate: function(templateName, optionsTemplate) {
                if (optionsTemplate instanceof OptionsTemplate === false) {
                    optionsTemplate = new OptionsTemplate(optionsTemplate);
                }

                this.optionsTemplate[templateName] = optionsTemplate;
            },
            importOptionsTemplate: function(templateName) {
                var res = this.optionsTemplate[templateName];

                if (res instanceof OptionsTemplate === false) {
                    throw new Error('Templates name: ' + templateName + ' is not defined.');
                }

                return res;
            },
            mergeOptionsTemplates: function() {
                var result = {};

                Array.prototype.forEach.call(arguments, function(el) {
                    if( TypeChecker.isObject(el) ) {
                        for (var k in el) {
                            if ( el.hasOwnProperty(k) === false ) {
                                continue;
                            }
                            if ( result[k] ) {
                                throw new Error('Template for ' + k + ' defined twice.');
                            }
                            result[k] = el[k];
                        }
                    }
                });

                return new OptionsTemplate(result);
            }
        };

        validators = OptionsManager.optionsValidators;
        OptionsManager.optionTypes = {};

        for (var type in validators) {
            OptionsManager.optionTypes[type] = new OptionType({name: type, validate: validators[type]});
        }

        Namespace.OptionsManager = OptionsManager;
    }

    if (typeof window === 'undefined') {
        module.exports = init;
    }
    if (typeof WEBSPELLCHECKER !== 'undefined' && !('OptionsManager' in WEBSPELLCHECKER)) {
        init(WEBSPELLCHECKER);
    }
})();