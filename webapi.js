/**
 * WebApi
 * @constructor
 * @instance
 * @param {Object} clientOptions
 * @param {String | Node} clientOptions.container Container with data
 */
(function(){
    var env, glob, envTypes = {
        node    : 'node',
        browser : 'browser'
    };

    if (typeof window === 'undefined') {
        glob = global;
        env = envTypes.node;
    } else {
        glob = window;
        env = envTypes.browser;
    }

    var WEBSPELLCHECKER = glob.WEBSPELLCHECKER || function(clientOptions) {
        //var validator = WEBSPELLCHECKER.Validator;
        // validator.addRules({
        //     customerId: 'isString'
        // });
        // validator.validate(clientOptions);

        this.addWordToTheUserDictionary = function(parametrs) {
            setTimeout(()=>{ parametrs.success();}, 100);
        };
        this.createUserDictionary = function(parametrs) {
            setTimeout(()=>{ parametrs.success();}, 100);
        };
        this.getUserDictionary = function(parametrs) {
            setTimeout(()=>{ parametrs.success();}, 100);
        };
        this.deleteUserDictionary = function(parametrs) {
            setTimeout(()=>{ parametrs.success();}, 100);
        };
        this.deleteWordFromUserDictionary = function(parametrs) {
            setTimeout(()=>{ parametrs.success();}, 100);
        };
        this.grammarCheck = function(parametrs) {
            setTimeout(()=>{ parametrs.success();}, 100);
        };
        this.renameUserDictionary = function(parametrs) {
            setTimeout(()=>{ parametrs.success();}, 100);
        };
        this.spellCheck = function(parametrs) {
            setTimeout(()=>{ parametrs.success();}, 100);
        };
        this.getLangList = function(parametrs) {
            setTimeout(()=>{ parametrs.success();}, 100);
        };
        this.getBanner = function(parametrs) {
            setTimeout(()=>{ parametrs.success();}, 100);
        };
    };
    WEBSPELLCHECKER.env = env;
    WEBSPELLCHECKER.envTypes = envTypes;
    WEBSPELLCHECKER.isNamespace = true;
    
    if(env === envTypes.node) {
         module.exports = WEBSPELLCHECKER;
    }
})();