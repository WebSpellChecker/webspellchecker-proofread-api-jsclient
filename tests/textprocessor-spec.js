var WebApi = require("../"), api, bool, TextProcessor, optionTypes;
if(WebApi.env === 'node' && typeof describe === 'undefined') {
    global.describe = function(t, r) {r()};
    global.beforeEach = function(r){r()};
    global.it = function(n, r){r()};
    global.expect = function(){
        return {
            toBeDefined: function(){},
            toEqual:function(){}
        }
    };
}


describe("TextProcessor", function () {
    
    beforeEach(function() {
        api = new WebApi();
        TextProcessor = api._getService('TextProcessor');
    });

    it("loaded", function() {
        expect(TextProcessor).toBeDefined();
    });

    it('should have main inteface methods: getWordsFromText', function() {
        expect(TextProcessor.getWordsFromText).toBeDefined();
    });

	it("should collect words in string that contains names of Object methods ['constructor __defineGetter__  __defineSetter__ __lookupSetter__ hasOwnProperty isPrototypeOf  propertyIsEnumerable toSource toLocaleString toString unwatch valueOf watch eval']", function() {
        var words = TextProcessor.getWordsFromText("constructor __defineGetter__  __defineSetter__ __lookupSetter__ hasOwnProperty isPrototypeOf  propertyIsEnumerable toSource toLocaleString toString unwatch valueOf watch eval");

		expect(words).toEqual([
            'constructor',
            'defineGetter',
            'defineSetter',
            'lookupSetter',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toSource',
            'toLocaleString',
            'toString',
            'unwatch',
            'valueOf',
            'watch',
            'eval'
        ]);
	});

	it("should collect words in string with characters: [\.\-\']", function() {
		var words = TextProcessor.getWordsFromText("test1.data1 test2-data2 test3'data3");

        expect(words).toEqual([
            'test1.data1',
            'test2-data2',
            "test3'data3"
        ]);
	});

	it("should collect words in string with repeated characters: [\.\-\']", function() {
		var words = TextProcessor.getWordsFromText("test1...data1 test2---data2 test3''data3");

        expect(words).toEqual([
            'test1',
            'data1',
            "test2",
            'data2',
            'test3',
            "data3",
        ]);
	});

	it("should collect words in string which starts or ends with characters: [\.\-\']", function() {
		var words = TextProcessor.getWordsFromText(".test1 test2.");

		expect(words).toEqual([
            'test1',
            'test2'
        ]);

		words = TextProcessor.getWordsFromText("-test1 test2-");

		expect(words).toEqual([
            'test1',
            'test2'
        ]);

		words = TextProcessor.getWordsFromText("'test1 test2'");

		expect(words).toEqual([
            'test1',
            'test2'
        ]);
    });

	it("should collect words with length more or equal to 4 by default", function() {
		var words = TextProcessor.getWordsFromText("soo this is a test");

        expect(words).toEqual([
            'this',
            'test'
        ]);
    });
    
    it("should be possible to change minimum words length that will be collected", function() {
		// var words, storedMinWordLengthValue;

		// // Change core setting
		// storedMinWordLengthValue = Core.options.minWordLength.value;
		// Core.options.minWordLength.value = 1;

		// words = TextProcessor.getWordsFromText("soo this is a test").words;

		// // restore it to previous value to prevent influence to other tests
		// Core.options.minWordLength.value = storedMinWordLengthValue;

		// expect(words).toEqual({ "word_soo": { word: "soo" }, "word_this" : { word : 'this' }, "word_is": { word: "is" }, "word_a": { word: "a" }, "word_test" : { word : 'test' } });
	});
});