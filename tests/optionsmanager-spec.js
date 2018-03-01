var WebApi, api, bool, OptionsManager, optionTypes;
// global.describe = function(t, r) {r()};
//     global.beforeEach = function(r){r()};
//     global.it = function(n, r){r()};
//     global.expect = function(){
//         return {
//             toBeDefined: function(){},
//             toEqual:function(){}
//         }
//     };
describe("OptionsManager", function () {

    beforeEach(function() {
        WebApi = (typeof window === 'undefined') ? require("../") : WEBSPELLCHECKER;
        OptionsManager = WebApi.OptionsManager;
        optionTypes = OptionsManager.optionTypes;
	});

    it("loaded", function() {
        expect(OptionsManager).toBeDefined();
    });

    it('should have main inteface methods: createOptions, extendOptionTypes', function() {
        expect(OptionsManager.createOptions).toBeDefined();
        expect(OptionsManager.extendOptionTypes).toBeDefined();
    });

    it('method "createOptions" should return options object', function() {
        var clientOptions = {test: 'test'},
            options = OptionsManager.createOptions(clientOptions);

        for(var k in options) {
            expect(options[k]).toBeDefined(clientOptions[k]);
        }
    });

    it('should set default value if clientOptions field is empty.', function() {
        var clientOptions = {
            serviceId: '1:ABC'
        },
        optionsTemplate = {
            lang: {
                type: optionTypes.string,
                defaultValue: 'en_US'
            },
            serviceId: {
                type: optionTypes.string,
                defaultValue: '1:CBA'
            }
        },
        options;

        options = OptionsManager.createOptions(clientOptions, optionsTemplate);

        expect(clientOptions.serviceId).toEqual(options.serviceId);
        expect(options.lang).toEqual(optionsTemplate.lang.defaultValue);
    });

    it('should throw error if use wrong parameter type.', function() {
        var clientOptions = {
            serviceId: '1:ABC'
        },
        optionsTemplate = {
            serviceId: {
                type: 'string',
                defaultValue: '1:CBA'
            }
        },
        options, error;
        try {
            options = OptionsManager.createOptions(clientOptions, optionsTemplate);
        } catch(e) {
            error = e;
        }
        expect(error).toBeDefined();
    });

    it('should set default value if type of field does not match.', function() {
        var clientOptions = {
            serviceId: 123,
            lang: ['en_US']
        },
        optionsTemplate = {
            lang: {
                type: optionTypes.string,
                defaultValue: 'en_US'
            },
            serviceId: {
                type: optionTypes.string,
                defaultValue: '1:CBA'
            }
        },
        options;

        options = OptionsManager.createOptions(clientOptions, optionsTemplate);

        expect(options.serviceId).toEqual(optionsTemplate.serviceId.defaultValue);
        expect(options.lang).toEqual(optionsTemplate.lang.defaultValue);
    });

    it('error handler should recive object with validation errors', function() {
        var clientOptions = {
            serviceId: 1442115,
            lang: ['en_US']
        },
        optionsTemplate = {
            lang: {
                type: optionTypes.string,
                defaultValue: 'en_US'
            },
            serviceId: {
                type: optionTypes.string,
                defaultValue: '1:CBA'
            }
        },
        options = OptionsManager.createOptions(clientOptions, optionsTemplate, function(errors) {
            expect(errors.count).toEqual(2);
            expect(errors.reports[0].optionName).toEqual('lang');
            expect(errors.reports[1].optionName).toEqual('serviceId');
        });
    });

    it('"critical" flag should set only if does not match required field.', function() {
        var clientOptions = {
            serviceId: 1442115,
            lang: ['en_US']
        },
        optionsTemplate = {
            lang: {
                type: optionTypes.string,
                defaultValue: 'en_US',
                required: true
            },
            serviceId: {
                type: optionTypes.string,
                defaultValue: '1:CBA'
            }
        },
        options = OptionsManager.createOptions(clientOptions, optionsTemplate, function(errors) {
            expect(errors.count).toEqual(2);
            expect(errors.critical).toEqual(true);
        });

        optionsTemplate.lang.required = false;
        options = OptionsManager.createOptions(clientOptions, optionsTemplate, function(errors) {
            expect(errors.count).toEqual(2);
            expect(errors.critical).toEqual(false);
        });
    });

    it('method "extendOptionTypes" should work correctly', function() {
        var TypeChecker = WebApi.Utils.TypeChecker;
        OptionsManager.extendOptionTypes({
            name: 'serviceId',
            validate: function(value) {
                return TypeChecker.isString(value) && value.indexOf("1:") === 0;
            }
        });

        var clientOptions1 = {
            serviceId: 'ABCD',
        },
        clientOptions2 = {
            serviceId: '1:ABCD',
        },
        optionsTemplate1 = {
            serviceId: {
                type: optionTypes.string,
                defaultValue: '1:CBA'
            }
        },
        optionsTemplate2 = {
            serviceId: {
                type: optionTypes.serviceId,
                defaultValue: '1:CBA'
            }
        }, options, errors;
        options = OptionsManager.createOptions(clientOptions1, optionsTemplate1, function(e) {
            errors = e;
        });
        expect(errors).toEqual(undefined);
        errors = undefined;

        options = OptionsManager.createOptions(clientOptions2, optionsTemplate1, function(e) {
            errors = e;
        });
        expect(errors).toEqual(undefined);
        errors = undefined;

        options = OptionsManager.createOptions(clientOptions1, optionsTemplate2, function(e) {
            errors = e;
        });
        expect(errors.count).toEqual(1);
        errors = undefined;

        options = OptionsManager.createOptions(clientOptions2, optionsTemplate1, function(e) {
            errors = e;
        });
        expect(errors).toEqual(undefined);
        errors = undefined;
    });
});