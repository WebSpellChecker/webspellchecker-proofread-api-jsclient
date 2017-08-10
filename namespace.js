(function() {
    // Define local variables
    var env, glob, envTypes = {
        node    : 'node',
        browser : 'browser'
    };
    // Define envirement (Browser or Node)
    if (typeof window === 'undefined') {
        glob = global;
        env = envTypes.node;
    } else {
        glob = window;
        env = envTypes.browser;
    }
    /**
     * @namespace
     */
    glob.WEBSPELLCHECKER = glob.WEBSPELLCHECKER || {};
    glob.WEBSPELLCHECKER.env = env;
    glob.WEBSPELLCHECKER.envTypes = envTypes;
    if(glob.WEBSPELLCHECKER.env === glob.WEBSPELLCHECKER.envTypes.node) {
        module.exports = glob.WEBSPELLCHECKER;
    }
})();