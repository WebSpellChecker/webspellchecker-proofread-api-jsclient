
 var WebApi, api, bool, TextProcessor, optionTypes;
//if(WebApi.env === 'node' && typeof describe === 'undefined') {
    // global.describe = function(t, r) {r()};
    // global.beforeEach = function(r){r()};
    // global.it = function(n, r){r()};
    // global.expect = function(){
    //     return {
    //         toBeDefined: function(){},
    //         toEqual:function(){}
    //     }
    // };
//}


describe("TextProcessor", function () {

    beforeEach(function() {
        WEBSPELLCHECKER = (typeof window === 'undefined') ? require("../") : WEBSPELLCHECKER;
        api = WEBSPELLCHECKER.initWebApi();
        TextProcessor = api._getService('TextProcessor');
    });

    it("loaded", function() {
        expect(TextProcessor).toBeDefined();
    });

    it('should have main inteface methods: getWordsFromString', function() {
        expect(TextProcessor.getWordsFromString).toBeDefined();
    });

	it("should collect words in string that contains names of Object methods ['constructor __defineGetter__  __defineSetter__ __lookupSetter__ hasOwnProperty isPrototypeOf  propertyIsEnumerable toSource toLocaleString toString unwatch valueOf watch eval']", function() {
        var words = TextProcessor.getWordsFromString("constructor __defineGetter__  __defineSetter__ __lookupSetter__ hasOwnProperty isPrototypeOf  propertyIsEnumerable toSource toLocaleString toString unwatch valueOf watch eval").wordsCollection;

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

    it("words offsets should define correctly", function() {
        var words = TextProcessor.getWordsFromString("constructor __defineGetter__  __defineSetter__");
        var offsets = words.wordsOffsets;

        var rightOffsets = [
            {
                startOffset: 0,
                endOffset: 11
            },
            {
                startOffset: 14,
                endOffset: 26
            },
            {
                startOffset: 32,
                endOffset: 44
            }
        ];
        for(var i = 0; i < offsets.length; i+= 1) {
            expect(
                offsets[i].startOffset,
                offsets[i].endOffset
            ).toEqual(
                rightOffsets[i].startOffset,
                rightOffsets[i].endOffset
            );
        }
	});

	it("should collect words in string with characters: [\.\-\']", function() {

		var words = TextProcessor.getWordsFromString("test1.data1 test2-data2 test3'data3").wordsCollection;

        expect(words).toEqual([
            'test1.data1',
            'test2-data2',
            "test3'data3"
        ]);
	});

	it("should collect words in string with repeated characters: [\.\-\']", function() {
		var words = TextProcessor.getWordsFromString("test1...data1 test2---data2 test3''data3").wordsCollection;

        expect(words).toEqual([
            'test1',
            'data1',
            "test2",
            'data2',
            'test3',
            "data3"
        ]);
	});

	it("should collect words in string which starts or ends with characters: [\.\-\']", function() {
		var words = TextProcessor.getWordsFromString(".test1 test2.").wordsCollection;

		expect(words).toEqual([
            'test1',
            'test2'
        ]);

		words = TextProcessor.getWordsFromString("-test1 test2-").wordsCollection;

		expect(words).toEqual([
            'test1',
            'test2'
        ]);

		words = TextProcessor.getWordsFromString("'test1 test2'").wordsCollection;

		expect(words).toEqual([
            'test1',
            'test2'
        ]);
    });

	it("should collect words with length more or equal to 4 by default", function() {
		var words = TextProcessor.getWordsFromString("soo this is a test").wordsCollection;

        expect(words).toEqual([
            'soo',
            'this',
            'test'
        ]);
    });

    it("should be possible to change minimum words length that will be collected", function() {
		var words, storedMinWordLengthValue;

		// Change core setting
		storedMinWordLengthValue = api.getOption('minWordLength');
		api.setOption('minWordLength', 1);
        words = TextProcessor.getWordsFromString("soo this is a test").wordsCollection;

        expect(words).toEqual([
            'soo',
            'this',
            'is',
            'a',
            'test'
        ]);
        // restore it to previous value to prevent influence to other tests
        api.setOption('minWordLength', storedMinWordLengthValue);
        words = TextProcessor.getWordsFromString("soo this is a test").wordsCollection;
        expect(words).toEqual([
            'soo',
            'this',
            'test'
        ]);
    });
});