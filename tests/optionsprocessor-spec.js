var WebApi, api, bool, OptionsProcessor, optionTypes;

describe("OptionsProcessor", function () {

    beforeEach(function() {
        WebApi = (typeof window === 'undefined') ? require("../") : WEBSPELLCHECKER;
        OptionsProcessor = WebApi.OptionsProcessor;
        optionTypes = OptionsProcessor.optionTypes;
	});

    it("loaded", function() {
        expect(OptionsProcessor).toBeDefined();
    });

    it('should have main inteface methods: createOptions, extendOptionTypes', function() {
        expect(OptionsProcessor.createOptions).toBeDefined();
        expect(OptionsProcessor.extendOptionTypes).toBeDefined();
    });

    it('method "createOptions" should return options object', function() {
        var clientOptions = {test: 'test'},
            options = OptionsProcessor.createOptions(clientOptions);

        for(var k in options) {
            expect(options[k]).toBeDefined(clientOptions[k]);
        }
    });

    it('should set default value if clientOptions field is empty.', function() {
        var clientOptions = {
            customerId: '1:ABC'
        },
        optionsTemplate = {
            lang: {
                type: optionTypes.string,
                defaultValue: 'en_US'
            },
            customerId: {
                type: optionTypes.string,
                defaultValue: '1:CBA'
            }
        },
        options;

        options = OptionsProcessor.createOptions(clientOptions, optionsTemplate);

        expect(clientOptions.customerId).toEqual(options.customerId);
        expect(options.lang).toEqual(optionsTemplate.lang.defaultValue);
    });

    it('should throw error if use wrong parameter type.', function() {
        var clientOptions = {
            customerId: '1:ABC'
        },
        optionsTemplate = {
            customerId: {
                type: 'string',
                defaultValue: '1:CBA'
            }
        },
        options, error;
        try {
            options = OptionsProcessor.createOptions(clientOptions, optionsTemplate);
        } catch(e) {
            error = e;
        }
        expect(error).toBeDefined();
    });

    it('should set default value if type of field does not match.', function() {
        var clientOptions = {
            customerId: 123,
            lang: ['en_US']
        },
        optionsTemplate = {
            lang: {
                type: optionTypes.string,
                defaultValue: 'en_US'
            },
            customerId: {
                type: optionTypes.string,
                defaultValue: '1:CBA'
            }
        },
        options;

        options = OptionsProcessor.createOptions(clientOptions, optionsTemplate);

        expect(options.customerId).toEqual(optionsTemplate.customerId.defaultValue);
        expect(options.lang).toEqual(optionsTemplate.lang.defaultValue);
    });

    it('should call validate function in template and send ther error if .', function() {
        var clientOptions = {
            customerId: '1:ABC',
            minWordLength: -1
        },
        optionsTemplate = {
            customerId: {
                type: optionTypes.string,
                defaultValue: '1:CBA'
            },
            minWordLength: {
                type: optionTypes.number,
                defaultValue: 3,
                validate: function(value) {
                    return value > 0;
                }
            }
        },
        options;

        options = OptionsProcessor.createOptions(clientOptions, optionsTemplate, function(errors) {
             expect(errors.count).toEqual(1);
        });

        expect(options.minWordLength).toEqual(optionsTemplate.minWordLength.defaultValue);
    });

    it('error handler should recive object with validation errors', function() {
        var clientOptions = {
            customerId: 1442115,
            lang: ['en_US']
        },
        optionsTemplate = {
            lang: {
                type: optionTypes.string,
                defaultValue: 'en_US'
            },
            customerId: {
                type: optionTypes.string,
                defaultValue: '1:CBA'
            }
        },
        options = OptionsProcessor.createOptions(clientOptions, optionsTemplate, function(errors) {
            expect(errors.count).toEqual(2);
            expect(errors.reports[0].optionName).toEqual('lang');
            expect(errors.reports[1].optionName).toEqual('customerId');
        });
    });

    it('"critical" flag should set only if does not match required field.', function() {
        var clientOptions = {
            customerId: 1442115,
            lang: ['en_US']
        },
        optionsTemplate = {
            lang: {
                type: optionTypes.string,
                defaultValue: 'en_US',
                required: true
            },
            customerId: {
                type: optionTypes.string,
                defaultValue: '1:CBA'
            }
        },
        options = OptionsProcessor.createOptions(clientOptions, optionsTemplate, function(errors) {
            expect(errors.count).toEqual(2);
            expect(errors.critical).toEqual(true);
        });

        optionsTemplate.lang.required = false;
        options = OptionsProcessor.createOptions(clientOptions, optionsTemplate, function(errors) {
            expect(errors.count).toEqual(2);
            expect(errors.critical).toEqual(false);
        });
    });

    it('method "extendOptionTypes" should work correctly', function() {
        var TypeChecker = WebApi.Utils.TypeChecker;
        OptionsProcessor.extendOptionTypes({
            name: 'customerId',
            validate: function(value) {
                return TypeChecker.isString(value) && value.indexOf("1:") === 0;
            }
        });

        var clientOptions1 = {
            customerId: 'ABCD',
        },
        clientOptions2 = {
            customerId: '1:ABCD',
        },
        optionsTemplate1 = {
            customerId: {
                type: optionTypes.string,
                defaultValue: '1:CBA'
            }
        },
        optionsTemplate2 = {
            customerId: {
                type: optionTypes.customerId,
                defaultValue: '1:CBA'
            }
        }, options, errors;
        options = OptionsProcessor.createOptions(clientOptions1, optionsTemplate1, function(e) {
            errors = e;
        });
        expect(errors).not.toBeDefined();
        errors = undefined;

        options = OptionsProcessor.createOptions(clientOptions2, optionsTemplate1, function(e) {
            errors = e;
        });
        expect(errors).not.toBeDefined();
        errors = undefined;

        options = OptionsProcessor.createOptions(clientOptions1, optionsTemplate2, function(e) {
            errors = e;
        });
        expect(errors.count).toEqual(1);
        errors = undefined;

        options = OptionsProcessor.createOptions(clientOptions2, optionsTemplate1, function(e) {
            errors = e;
        });
        expect(errors).not.toBeDefined();
        errors = undefined;
    });
});