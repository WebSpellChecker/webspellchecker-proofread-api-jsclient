var WebApi, WEBSPELLCHECKER,
 api, bool,
    UD_NAME = 'test1_js_webapi_ud',
    NEW_UD_NAME = 'new_test1_js_webapi_ud',
    WORD = 'exampl',
    WORD2 = 'mispelled',
    TEXT = 'This is an exampl of a sentence with two mispelled words. Just type text with misspelling to see how it works.',
    TEXTGRAMMAR = 'These are an examples of a sentences with two misspelled words and gramar problems. Just type text with mispelling to see how it works.',
    StringUtils,
    api, bool, TextProcessor, optionTypes;

describe("WebApi", function () {

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
        expect(value).not.toBeDefined();
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
        }, 20000);
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
        }, 20000);
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
        }, 20000);
    });

    it("grammarCheck method should check grammar misspells in text", function() {
        var bool = false;
            api.grammarCheck({
                text: TEXTGRAMMAR,
                success: function(res) {
                   if(res && !res.error) {
                        bool = true;
                    }
                }
            });

        waitsFor(function() {
            return bool;
        }, 20000);
    });

    it("getUserDictionary, createUserDictionary deleteUserDictionary methods flow should work correctly", function() {
        var bool = false;

        function createUD() {
            api.createUserDictionary({
                name: UD_NAME,
                wordList: WORD + ',' + WORD2,
                success: function(res) {
                    if(res && !res.error) {
                        bool = true;
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
            }, 20000);
        });
    });

    it("renameUserDictionary method should change UD name", function() {
        var bool = false;
        api.renameUserDictionary({
            name: UD_NAME,
            newName: NEW_UD_NAME,
            success: function(res) {
                bool = true;
                api.renameUserDictionary({
                    name: NEW_UD_NAME,
                    newName: UD_NAME,
                    success: function(res) {
                        bool = true;
                    }
                });
            }
        });
        waitsFor(function() {
            return bool;
        }, 20000);
    });


    it("deleteUserDictionary method should delete UD", function() {
        var bool = false;
        api.deleteUserDictionary({
            newName: UD_NAME,
            success: function(res) {
                bool = true;
            }
        });
        waitsFor(function() {
            return bool;
        }, 20000);
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
                wordList[wordList.length - 1] === WORD) {
                return true;
            }
        }, 20000);
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
                api.createUserDictionary({
                    name: UD_NAME,
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
        }, 20000);

    });

    describe("UserDictionary Object", function() {
        var ud_res, params = {
            name: UD_NAME
        };
        afterEach(function() {
            api.deleteUserDictionary({name: UD_NAME});
        });

        it("'addWord' should add word", function() {
            var ud_res;
            params.success = function() {
                api.getUserDictionary({
                    name: UD_NAME,
                    success: function(ud) {
                        ud.addWord({
                            word: 'tripa',
                            success: function() {
                                ud_res = ud;
                            }
                        });
                    },
                });
            };

            api.createUserDictionary(params);

            waitsFor(function() {
                if(ud_res) {
                    if(ud_res.wordlist.includes('tripa')) {
                        return true;
                    }
                }
            }, 20000);
        });

        it("'deleteWord' should delete word", function() {
            var ud_res;
            params.success = function() {
                api.getUserDictionary({
                    name: UD_NAME,
                    success: function(ud) {
                        ud.addWord({
                            word: 'tripa',
                            success: function(ud) {
                                ud.deleteWord({
                                    word: 'tripa',
                                    success: function(data) {
                                        ud_res = ud;
                                    }
                                });
                            }
                        });
                    }
                });
            };
            api.createUserDictionary(params);
            waitsFor(function() {
                if(ud_res && !ud_res.wordlist.includes('tripa')) {
                    return true;
                }
            }, 20000);
        });

        it("'rename' should rename dictionary", function() {
            var ud_res, newN = 'temt_test_name', bool = false;
            api.deleteUserDictionary({
                name: newN
            });
            params.success = function() {
                api.getUserDictionary({
                    name: UD_NAME,
                    success: function(ud) {
                        ud.rename({
                            newName: newN,
                            success: function(ud) {
                                if(ud.name === newN) {
                                    ud.rename({
                                        newName: UD_NAME,
                                        success: function(ud) {
                                            if(ud.name === UD_NAME) {
                                                bool = true;
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            };
            api.createUserDictionary(params);
            waitsFor(function() {
                if(bool) {
                    return true;
                }
            }, 20000);
        });

        it("'delete' should delete dictionary", function() {
            var ud_res, newN = 'temt_test_name', bool = false;
            params.success = function() {
                api.getUserDictionary({
                    name: UD_NAME,
                    success: function(ud) {
                        ud.delete({
                            success: function() {
                                bool = true;
                            }
                        });
                    }
                });
            };
            api.createUserDictionary(params);
            waitsFor(function() {
                if(bool) {
                    return true;
                }
            }, 20000);
        });
    });
});