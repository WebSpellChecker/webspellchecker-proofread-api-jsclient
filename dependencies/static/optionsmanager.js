// OptionsManager.js
/**
 * @fileoverview Static Module. OptionsManager
 */
(function(){
	function init( Namespace ) {
        var TypeChecker = Namespace.Utils.TypeChecker,
            ArrayUtils = Namespace.Utils.ArrayUtils, validators,
            RegularsManager = Namespace.RegularsManager;

        /**
         * Constructor for option type.
         * @constructor
         *
         * @param {String} name - type name.
         * @param {Function} validate - Parameter validation checker.
         * @private
         */
        function OptionType(name, validate) {
            this.name = name;
            this.validate = validate;
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
                if(error.critical && this.critical === false) {
                    this.critical = true;
                }
                this.reports.push(error);
                this.count += 1;
            };
        }

        function OptionsObject(options, createOptionValue) {
            if(options instanceof this.constructor) {
                return options;
            }
            Object.assign(this, options);
            this._createOptionValue = createOptionValue;
            this._validatedFields = [];
        }

        OptionsObject.prototype = {
            constructor: OptionsObject,
            addOption: function(option) {
                var name = option.name;
                if( !this._validatedFields.includes(name) ) {
                    this[name] = this._createOptionValue(option);
                    if(typeof this[name] !== 'undefined') {
                        this._validatedFields.push(name);
                    }
                }
            }
        };

        function OptionsTemplate(template) {
            Object.assign(this, template);
        }

        OptionsTemplate.prototype = {
            constructor: OptionsTemplate,
            setDefaults: function(defaults) {
                for(var k in defaults) {
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
                url_protocol: function(value) {
                    return value === 'http' || value === 'https';
                },
                url_host:function(value) {
                    return TypeChecker.notEmptyString(value);// && Regular test ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=
                },
                url_port: function(value) {
                    if( TypeChecker.isNumber(value) ) {
                        return TypeChecker.isInteger(value);
                    } else if(TypeChecker.isString) {
                        return TypeChecker.isInteger( parseFloat(value) );
                    }
                    return false;
                },
                url_path: function(value) {
                    return TypeChecker.notEmptyString(value);// && Regular test ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=
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
            createOptionValue: function ( optionData ) {
                var optionValue = optionData.value,
                    optionTemplate = optionData.template,
                    errorReport = {},
                    optionName = optionData.name,
                    optionErrorHandler = optionData.errorHandler,
                    validated,
                    defaultValue = optionTemplate.defaultValue;

                if(optionValue === undefined && !optionTemplate.required) return defaultValue;
                validated = optionTemplate.type.validate(optionValue);

                if(validated) return optionValue;

                errorReport.critical = optionTemplate.required || false;
                errorReport.optionName = optionName;
                errorReport.message = 'Parameter ' + optionName + ' should have a type - ' + optionTemplate.type.name + '.';

                optionErrorHandler(errorReport);

                return defaultValue;
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
            createOptions: function(clientOptions, template, errorHandler) {
                var option, valid,
                    options = new OptionsObject( clientOptions, this.createOptionValue.bind(this) ),
                    optionsTemplate,
                    errorsObject = new ErrorsObject();

                if( TypeChecker.isString(template) ) {
                    optionsTemplate = this.importOptionsTemplate(template);
                } else if( TypeChecker.isObject(template) ) {
                    optionsTemplate = template;
                }
                for(var k in optionsTemplate) {
                    if( optionsTemplate.hasOwnProperty(k) === false ) continue;
                    if(optionsTemplate[k].type instanceof OptionType === false) {
                        throw new Error(k + ' template "type" parameter should be instance of OptionsManager.OptionType constructor.');
                    }
                    options.addOption({
                        name: k,
                        value: options[k],
                        template: optionsTemplate[k],
                        errorHandler: function(error) {
                            errorsObject.addError(error);
                        }
                    });

                }
                if(errorHandler && errorsObject.count > 0) {
                    errorHandler(errorsObject);
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
                if( !type.name || !TypeChecker.isFunction(type.validate) ) return false;
                if(!this.optionTypes[type.name]) {
                    this.optionTypes[type.name] = new OptionType(type.name, type.validate);
                }
            },
            exportOptionsTemplate: function(templateName, optionsTemplate) {
                if(optionsTemplate instanceof OptionsTemplate === false) {
                    optionsTemplate = new OptionsTemplate(optionsTemplate);
                }
                this.optionsTemplate[templateName] = optionsTemplate;
            },
            importOptionsTemplate: function(templateName) {
                var res = this.optionsTemplate[templateName];
                if(res instanceof OptionsTemplate === false) {
                    throw new Error('Templates name: ' + templateName + ' is not undefined.');
                }

                return new OptionsTemplate(res);
            },
            mergeOptionsTemplates: function() {
                var result = {};
                Array.prototype.forEach.call(arguments, function(el) {
                    if( TypeChecker.isObject(el) ) {
                        Object.assign(result, el);
                    }
                });

                return new OptionsTemplate(result);
            }
        };

        validators = OptionsManager.optionsValidators;
        OptionsManager.optionTypes = {};
        for(var type in validators) {
            OptionsManager.optionTypes[type] = new OptionType(type, validators[type]);
        }

        Namespace.OptionsManager = OptionsManager;
    }
    if(typeof window === 'undefined') {module.exports = init;}
	if(typeof WEBSPELLCHECKER !== 'undefined') {init(WEBSPELLCHECKER);}
})();