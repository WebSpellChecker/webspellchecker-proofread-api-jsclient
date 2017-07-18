var WebApi = require("../"), api, bool,
    UD_NAME = 'ud1',
    WORD = 'tita',
    TEXT = 'Hella! I am a doctor Watson';

describe("WebApi", function () {

    beforeEach(function() {
		api = new WebApi();
	});

    it("loaded", function() {
        expect(WebApi).toBeDefined();
    });

    it("static dependencies defined", function() {
        expect(WebApi.Utils).toBeDefined();
        expect(WebApi.IO).toBeDefined();
        expect(WebApi.OptionsProcessor).toBeDefined();
        expect(WebApi.RegularsManager).toBeDefined();
        expect(WebApi.logger).toBeDefined();
	});

    it("WebApi should have public api methods", function() {
        var methodsList = [
            'createUserDictionary',
            'getUserDictionary',
            'renameUserDictionary',
            'deleteUserDictionary',
            'addWordToTheUserDictionary',
            'deleteWordFromUserDictionary',
            'spellCheck',
            'grammarCheck',
            'getLangList',
            'getBanner'
        ];

        for (var i = 0; i < methodsList.length; i +=1) {
            expect( api[methodsList[i]] ).toBeDefined();
        }
	});

    it("spellCheck method should check misspells in text", function() {
        bool = false;
        waitsFor(function() {
            api.spellCheck({
                text: TEXT,
                success: function(res) {
                    bool = true;
                }
            });
            return bool;
        });
    });

    it("grammarCheck method should check grammar misspells in text", function() {
        bool = false;
        waitsFor(function() {
            api.grammarCheck({
                text: TEXT,
                success: function(res) {
                    bool = true;
                }
            });
            return bool;
        });
    });

    it("getLangList method should return list with available languages", function() {
        bool = false;
        waitsFor(function() {
            api.getLangList({
                text: TEXT,
                success: function(res) {
                    bool = true;
                }
            });
            return bool;
        });
    });

    it("getBanner method should return bool - banner true | false", function() {
        bool = false;
        waitsFor(function() {
            api.getBanner({
                text: TEXT,
                success: function(res) {
                    bool = true;
                }
            });
            return bool;
        });
    });

    it("createUserDictionary method should create UD", function() {
        bool = false;
        waitsFor(function() {
            api.getUserDictionary({
                name: UD_NAME,
                success: function(res) {
                    bool = true;
                }
            });
            return bool;
        });

        runs(function() {
            bool = false;
            waitsFor(function() {
                api.createUserDictionary({
                    name: UD_NAME,
                    success: function(res) {
                        bool = true;
                    }
                });
                return bool;
            });
        });

         runs(function() {
            bool = false;
            waitsFor(function() {
                api.getUserDictionary({
                    name: UD_NAME,
                    success: function(res) {
                        bool = true;
                    }
                });
                return bool;
            });
        });
    });

    it("getUserDictionary method should return UD name and words", function() {
        bool = false;
        waitsFor(function() {
            api.getUserDictionary({
                name: UD_NAME,
                success: function(res) {
                    bool = true;
                }
            });
            return bool;
        });
    });

    it("renameUserDictionary method should change UD name", function() {
        bool = false;
        waitsFor(function() {
            api.renameUserDictionary({
                name: UD_NAME,
                success: function(res) {
                    bool = true;
                }
            });
            return bool;
        });
    });


    it("addWordToTheUserDictionary method should add words to current UD", function() {
        bool = false;
        waitsFor(function() {
            api.getUserDictionary({
                name: UD_NAME,
                success: function(res) {
                    bool = true;
                }
            });
            return bool;
        });

        runs(function() {
            bool = false;
            waitsFor(function() {
                api.addWordToTheUserDictionary({
                    name: UD_NAME,
                    word: WORD,
                    success: function(res) {
                        bool = true;
                    }
                });
                return bool;
            });
        });

        waitsFor(function() {
            api.getUserDictionary({
                name: UD_NAME,
                success: function(res) {
                    bool = true;
                }
            });
            return bool;
        });
    });

    it("deleteWordFromUserDictionary method should delete words to current UD", function() {
        bool = false;
        waitsFor(function() {
            api.getUserDictionary({
                name: UD_NAME,
                success: function(res) {
                    bool = true;
                }
            });
            return bool;
        });

        runs(function() {
            bool = false;
            waitsFor(function() {
                api.deleteWordFromUserDictionary({
                    name: UD_NAME,
                    word: WORD,
                    success: function(res) {
                        bool = true;
                    }
                });
                return bool;
            });
        });

        waitsFor(function() {
            api.getUserDictionary({
                name: UD_NAME,
                success: function(res) {
                    bool = true;
                }
            });
            return bool;
        });
    });

    it("deleteUserDictionary method should delete UD", function() {
        bool = false;
        waitsFor(function() {
            api.getUserDictionary({
                name: UD_NAME,
                success: function(res) {
                    bool = true;
                }
            });
            return bool;
        });

        runs(function() {
            bool = false;
            waitsFor(function() {
                api.deleteUserDictionary({
                    name: UD_NAME,
                    success: function(res) {
                        bool = true;
                    }
                });
                return bool;
            });
        });

         runs(function() {
            bool = false;
            waitsFor(function() {
                api.getUserDictionary({
                    name: UD_NAME,
                    success: function(res) {
                        bool = true;
                    }
                });
                return bool;
            });
        });
    });

});