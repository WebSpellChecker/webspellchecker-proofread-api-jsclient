// OptionsProcessor.js
/**
 * @fileoverview Static Module. OptionsProcessor
 */
(function(){
	function init( Namespace ) {
        var TypeChecker = Namespace.Utils.TypeChecker, validators,
            RegularsManager = Namespace.RegularsManager;

        function OptionType(name, validate) {
            this.name = name;
            this.validate = validate;
        }

        var OptionsProcessor = {
            optionTypes: {},
            optionsValidators: {
                array: TypeChecker.isArray,
                boolean: TypeChecker.isBoolean,
                date: TypeChecker.isDate,
                defined: TypeChecker.isDefined,
                empty: TypeChecker.isEmpty,
                function: TypeChecker.isFunction,
                hash: TypeChecker.isHash,
                integer:TypeChecker.isInteger,
                number: TypeChecker.isNumber,
                object: TypeChecker.isObject,
                string: TypeChecker.isString,
                url_protocol: function(value) {
                    return value === 'http' || value === 'https';
                },
                url_host:function(value) {
                    return TypeChecker.isString(value);// && Regular test ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=
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
                    return TypeChecker.isString(value);// && Regular test ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;=
                }
            },
            validateOption: function (optionValue, validationCheckList, errorsList) {
                var res = {
                    pass: true,
                    errorMessage: undefined
                },
                validationRule;

                for(var k in validationCheckList) {
                    validationRule = validationCheckList[k];
                    if(TypeChecker.isFunction(validationRule) && validationRule(optionValue) === false) {
                        res.pass = false;
                        res.errorMessages = errorsList[k];
                        return res;
                    }
                }

                return res;
            },
            ErrorsObject: function() {
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
            },
            createOption: function ( option ) {
                var optionValue = option.value,
                    optionTemplate = option.template,
                    errorReport = {},
                    optionName = option.name,
                    optionErrorHandler = option.errorHandler,
                    validationInfo,
                    validationCheckList = {
                        type: optionTemplate.type.validate,
                        requirements: optionTemplate.validate
                    },
                    errorsList = {
                        type: 'Parameter ' + optionName + ' should be a ' + optionTemplate.type.name + '.',
                        requirements: optionName + ' Parameter is not valid for internal requirements.'
                    },
                    defaultValue = optionTemplate.defaultValue;


                if(optionValue === undefined && optionTemplate.required === false) return defaultValue;
                validationInfo = this.validateOption(optionValue, validationCheckList, errorsList);

                if(validationInfo.pass) return optionValue;

                errorReport.critical = optionTemplate.required || false;
                errorReport.optionName = optionName;
                errorReport.message = validationInfo.errorMessages;

                optionErrorHandler(errorReport);

                return defaultValue;
            },
            createOptions: function(_options, _optionsTemplates, _errorHandler) {
                var option, valid,
                    options = Object.assign({}, _options),
                    optionsTemplates = Object.assign({}, _optionsTemplates),
                    errorsObject = new this.ErrorsObject();

                for(var k in optionsTemplates) {
                    if( optionsTemplates.hasOwnProperty(k) === false ) continue;
                    if(optionsTemplates[k].type instanceof OptionType === false) {
                        throw new Error(k + ' template "type" parameter should be instance of OptionsProcessor -> OptionType constructor.');
                    }
                    options[k] = this.createOption({
                        name: k,
                        value: options[k],
                        template: optionsTemplates[k],
                        errorHandler: function(error) {
                            errorsObject.addError(error);
                        }
                    });

                }
                if(_errorHandler && errorsObject.count > 0) {
                    _errorHandler(errorsObject);
                }

                return options;
            },
            extendOptionTypes: function(type) {
                if( !type.name || !TypeChecker.isFunction(type.validate) ) return false;
                if(!this.optionTypes[type.name]) {
                    this.optionTypes[type.name] = new OptionType(type.name, type.validate);
                }
            }
        };

        validators = OptionsProcessor.optionsValidators;
        OptionsProcessor.optionTypes = {};
        for(var type in validators) {
            OptionsProcessor.optionTypes[type] = new OptionType(type, validators[type]);
        }

        Namespace.OptionsProcessor = OptionsProcessor;
    }
    if(typeof window === 'undefined') {module.exports = init;}
	if(typeof WEBSPELLCHECKER !== 'undefined') {init(WEBSPELLCHECKER);}
})();