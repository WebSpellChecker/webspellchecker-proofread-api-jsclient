(function() {
    // Define local variables
    var envTypes = {
            node: 'node',
            browser: 'browser'
        },
        env,
        glob;

    // Define environment (Browser or Node)
    if (typeof window === 'undefined') {
        glob = global;
        env = envTypes.node;
    } else {
        glob = window;
        env = envTypes.browser;
    }

    glob.WEBSPELLCHECKER = glob.WEBSPELLCHECKER || {};
    glob.WEBSPELLCHECKER.env = env;
    glob.WEBSPELLCHECKER.envTypes = envTypes;

    if (env === envTypes.node) {
        module.exports = glob.WEBSPELLCHECKER;
    }
})();