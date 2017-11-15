var WebApi, WEBSPELLCHECKER,
 api, bool,
    UD_NAME = 'test_js_webapi_ud',
    NEW_UD_NAME = 'new_test_js_webapi_ud',
    WORD = 'exampl',
    WORD2 = 'mispelled',
    TEXT = 'This is an exampl of a sentence with two mispelled words. Just type text with misspelling to see how it works.',
    TEXTGRAMMAR = ['These are an examples of a sentences with two misspelled words and gramar problems', 'Just type text with mispelling to see how it works.'],
    StringUtils,
    api, bool, TextProcessor, optionTypes;

// global.describe = function(t, r) {r()};
// global.beforeEach = function(r){r()};
// global.it = function(n, r){r()};
// global.expect = function(){
//     return {
//         toBeDefined: function(){},
//         toEqual:function(){}
//     }
// };

xdescribe("WebApi", function () {

    beforeEach(function() {
        WEBSPELLCHECKER = (typeof window === 'undefined') ? require("../") : WEBSPELLCHECKER;
        StringUtils = WEBSPELLCHECKER.Utils.StringUtils;
		api = WEBSPELLCHECKER.initWebApi();
	});

    it("loaded", function() {
        expect(api).toBeDefined();
    });

    it("static dependencies defined", function() {
        expect(WEBSPELLCHECKER.Utils).toBeDefined();
        expect(WEBSPELLCHECKER.IO).toBeDefined();
        expect(WEBSPELLCHECKER.OptionsManager).toBeDefined();
        expect(WEBSPELLCHECKER.RegularsManager).toBeDefined();
        expect(WEBSPELLCHECKER.logger).toBeDefined();
	});

    it("WebApi should have public api methods", function() {
        var methodsList = [
            'createUserDictionary',
            'getUserDictionary',
            'renameUserDictionary',
            'deleteUserDictionary',
            'addWordToUserDictionary',
            'deleteWordFromUserDictionary',
            'spellCheck',
            'grammarCheck',
            'getLangList'
        ];

        for (var i = 0; i < methodsList.length; i +=1) {
            expect( api[methodsList[i]] ).toBeDefined();
        }

    });

    it("getOption and setOptions should work", function() {
        var boolRes, value;
        boolRes = api.setOption('test', true);
        value = api.getOption('test');
        expect(boolRes).toEqual(false);
        expect(value).toEqual(undefined);
        boolRes = api.setOption('lang', 'en_US');
        expect(boolRes).toEqual(true);
        value = api.getOption('lang');
        expect(value).toEqual('en_US');
	});

    it("getLangList method should return list with available languages", function() {
        bool = false;
        api.getLangList({
            success: function(res) {
                bool = true;
            }
        });

        waitsFor(function() {
              return bool;
        });
    });

    it("spellCheck method should check misspells in text", function() {
        var bool = false;
            api.spellCheck({
                text: TEXT,
                success: function(res) {
                    if(res && !res.error) {
                        bool = true;
                    }
                }
            });

        waitsFor(function() {
            return bool;
        });
    });

    it("spellCheck method should return correct position for misspelled words", function() {
        var bool = false;
             api.spellCheck({
                text: TEXT,
                success: function(res) {
                    var text = TEXT,
                        missp;
                    res.reverse()
                    for(var i = 0; i < res.length; i += 1 ) {
                        missp = res[i];
                        text = StringUtils.replaceFromTo(text, missp.startOffset, missp.endOffset, missp.suggestions[0]);
                    }
                    if(text === 'This is an example of a sentence with two misspelled words. Just type text with misspelling to see how it works.') {
                        bool = true;
                    }
                }
            });

        waitsFor(function() {
            return bool;
        });
    });

    it("grammarCheck method should check grammar misspells in text", function() {
        var bool = false;
            api.grammarCheck({
                sentences: TEXTGRAMMAR,
                success: function(res) {
                   if(res && !res.error) {
                        bool = true;
                    }
                }
            });

        waitsFor(function() {
            return bool;
        });
    });

    describe("UserDictionary", function () {
        it("getUserDictionary, createUserDictionary deleteUserDictionary methods flow should work correctly", function() {
            var bool = false;

            function createUD() {
                api.createUserDictionary({
                    name: UD_NAME,
                    wordList: WORD + ',' + WORD2,
                    success: function(res) {
                        if(res && !res.error) {
                            api.deleteUserDictionary({
                                newName: UD_NAME,
                                success: function(res) {
                                    bool = true;
                                }
                            });
                        }
                    }
                });
            }

            runs(function() {
                api.getUserDictionary({
                    name: UD_NAME,
                    success: function(res) {
                        api.deleteUserDictionary({
                            name: UD_NAME,
                            success: function(res) {
                                createUD();
                            }
                        });
                    },
                    error: function(res) {
                        createUD();
                    }
                });

                waitsFor(function() {
                    return bool;
                });
            });
        });

        it("renameUserDictionary method should change UD name", function() {
            var bool = false;
            api.deleteUserDictionary({
                name: NEW_UD_NAME,
                success: function() {
                    api.deleteUserDictionary({
                        name: UD_NAME,
                        success: function() {
                            api.createUserDictionary({
                                name: UD_NAME,
                                success: function(res) {
                                    api.renameUserDictionary({
                                        name: UD_NAME,
                                        newName: NEW_UD_NAME,
                                        success: function(res) {
                                            api.deleteUserDictionary({
                                                name: NEW_UD_NAME,
                                                success: function(res) {
                                                    bool = true;
                                                }
                                            });
                                        }
                                    });
                                },
                            });
                        }
                    });
                }
            });

            waitsFor(function() {
                return bool;
            });
        });


        it("deleteUserDictionary method should delete UD", function() {
            var bool = false;
            api.createUserDictionary({
                name: UD_NAME,
                success: function(res) {
                    api.deleteUserDictionary({
                        newName: UD_NAME,
                        success: function(res) {
                            bool = true;
                        }
                    });
                }
            });

            waitsFor(function() {
                return bool;
            });
        });

        it("addWordToUserDictionary method should add words to current UD", function() {
            var bool = false,
                wordList,
                wordListLengthBefore,
                wordListLengthAfter;

            function addWord() {
                api.addWordToUserDictionary({
                    name: UD_NAME,
                    word: WORD,
                    success: function(res) {
                        api.getUserDictionary({
                            name: UD_NAME,
                            success: function(res) {
                                wordListLengthAfter = res.wordlist.length;
                                wordList = res.wordlist;
                                api.deleteUserDictionary({
                                    name: UD_NAME,
                                    success: function(res) {
                                        bool = true;
                                    }
                                });
                            }
                        });
                    }
                });
            }

            api.getUserDictionary({
                name: UD_NAME,
                success: function(res) {
                    wordListLengthBefore = res.wordlist.length;
                    addWord();
                },
                error: function() {
                    api.createUserDictionary({
                        name: UD_NAME,
                        success: function(res) {
                            addWord();
                        },
                    });
                }
            });

            waitsFor(function() {
                if(wordListLengthAfter === ( wordListLengthBefore + 1) &&
                    wordList[wordList.length - 1] === WORD &&
                    bool === true) {
                    return true;
                }
            });
        });

        it("deleteWordFromUserDictionary method should delete words from current UD", function() {
            var bool = false,
                wordList,
                wordListLengthBefore,
                wordListLengthAfter;

            function deleteWord() {
                api.deleteWordFromUserDictionary({
                    name: UD_NAME,
                    word: WORD,
                    success: function(res) {

                        api.getUserDictionary({
                            name: UD_NAME,
                            success: function(res) {
                                wordListLengthAfter = res.wordlist.length;
                                wordList = res.wordlist;
                                bool = true;
                                api.deleteUserDictionary({
                                    newName: UD_NAME,
                                    success: function(res) {
                                        bool = true;
                                    }
                                });
                            }
                        });
                    }
                });
            }

            api.getUserDictionary({
                name: UD_NAME,
                success: function(res) {
                    wordListLengthBefore = res.wordlist.length;
                    deleteWord();
                },
                error: function(error) {
                    wordListLengthBefore = 2;
                    api.createUserDictionary({
                        name: UD_NAME,
                        wordList: WORD + ',' + WORD2,
                        success: function(res) {
                            deleteWord();
                        },
                    });
                }
            });

            waitsFor(function() {
                if( wordListLengthAfter < wordListLengthBefore  ) {
                    return true;
                }
            });

        });
    });
});