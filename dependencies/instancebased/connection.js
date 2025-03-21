// Connection.js
/**
 * @fileoverview Connection module.
 */
(function(){
    'use strict';
	function init( Namespace ) {

        var IO = Namespace.IO,
            _parametersMap = {
                serviceId: 'customerid',
                command: 'cmd',
                communicationFormat: 'format',
                userDictionary: 'user_dictionary',
                customDictionary: 'custom_dictionary',
                UDAction: 'action',
                UDName: 'name',
                newUDName: 'new_name',
                removeUDCookie: 'remove_ud_cookie',
                UDWord: 'word',
                userWordlist: 'user_wordlist',
                wordList: 'wordlist',
                language: 'lang',
                autoLangPriorities: 'auto_lang_priorities',
                detectedLang: 'detected_lang',
                enforceAI: 'enforce_ai',
                outType: 'out_type',
                text: 'text',
                sentences: 'sentences',
                tokens: 'tokens',
                appType: 'app_type',
                customPunctuation: 'custom_punctuation',
                minWordLength: 'min_word_length',
                shortAnswer: 'short_answer',
                disableSpelling: 'disable_spelling',
                disableGrammar: 'disable_grammar',
                disableStyleGuide: 'disable_style_guide',
                version: 'version',
                locale: 'locale',
                action: 'action',
                newText: 'new_text',
                type: 'type',
                category: 'category',
                rule: 'rule',
                context: 'context',
                session: 'session',
                offset: 'offset',
                timestamp: 'timestamp',
                prompt: 'prompt',
                suggestions: 'suggestions',
                checkKit: 'check_kit',
                probability: 'probability',
                responseTime: 'response_time'
            },
            _commandsMap = {
                spellCheck: 'check_spelling',
                grammarCheck: 'grammar_check',
                check: 'check',
                autocorrect: 'autocorrect',
                autocomplete: 'autocomplete',
                getPrompts: 'get_prompts',
                generate: 'generate',
                userDictionary: 'user_dictionary',
                getLangList: 'get_lang_list',
                getInfo: 'get_info',
                getDictionariesModifyTime: 'get_dicts_modify_time',
                statistics: 'statistics'
            },
            _UDActionsMap = {
                create: 'create',
                'delete': 'delete',
                rename: 'rename',
                check: 'check',
                addWord: 'addword',
                deleteWord: 'deleteword',
                getDict: 'getdict'
            };
        /**
         * Represents Connection Module.
         * Module for working with server commands and preparing request info.
         * @constructor
         * @alias WEBSPELLCHECKER.Connection
         *
         * @param {String} moduleId - Moduloe name;
         * @param {Object} appInstance - Instance of main app.
         * @private
         */
        function Connection(moduleId, appInstance) {
            this.moduleId = moduleId;
            this.appInstance = appInstance;

            this.url = new IO.URL({
				protocol 	: appInstance.getOption('serviceProtocol'),
				host 		: appInstance.getOption('serviceHost'),
				port 		: appInstance.getOption('servicePort'),
				path 		: appInstance.getOption('servicePath')
            });

            this.withCredentials = appInstance.getOption('withCredentials');
            this.requestHeaders = appInstance.getOption('requestHeaders');

            this.defaultParameters = this.setDefaults(['serviceId', 'communicationFormat', 'appType'], _parametersMap);
        }

        Connection.prototype = {
            constructor: Connection,
            /**
             * Accessor for map of cmd request parameter values.
             * @memberof WEBSPELLCHECKER.Connection#
             *
             * @returns {Object} - List of server commands.
             * @private
             */
            getCommands: function() {
                return _commandsMap;
            },
            /**
             * Accessor for map of user dictionary actions.
             * @memberof WEBSPELLCHECKER.Connection#
             *
             * @returns {Object} - List of UD actions.
             * @private
             */
            getUdActions: function() {
                return _UDActionsMap;
            },
            /**
             * Define common parameters for each request.
             * @memberof WEBSPELLCHECKER.Connection#
             *
             * @private
             */
            setDefaults: function(paramsNames, map) {
                var storage = {};
                paramsNames.forEach(function(name) {
                    storage[ map[name] ] = this.appInstance.getOption(name);
                }, this);
                return storage;
            },
            /**
             * Return clone of url object for request.
             * @memberof WEBSPELLCHECKER.Connection#
             *
             * @returns {Object} - Clone of IO url object.
             * @private
             */
            getURL: function() {
                return this.url.clear();
            },
            /**
             * Prepare client parameters before request.
             * Collect request parameters from _parametersMap.
             * @memberof WEBSPELLCHECKER.Connection#
             *
             * @param {Object} parameters - Wrapped requst parameters.
             * @param {Object} map - map to server parameters names.
             *
             * @returns {Object} - Requst parameters.
             * @private
             */
            prepareParameters: function(parameters, map) {
                var result = {},
                    paramName;

                for(var k in parameters) {
                    paramName = map[k];
                    if(!paramName) {
                        throw new Error('parameter ' + k + ' is not specified.');
                    }
                    result[paramName] = parameters[k];
                }
                result = Object.assign({}, this.defaultParameters, result);

                // Now we have the bag with get_lang_list command.
                // It's doesn't work for some reasons in server side with "format=json" parameter.
                // we should remove this parametr for get_lang_list command;
                if(result[map.command] === _commandsMap.getLangList) {
                    delete result[map.communicationFormat];
                }

                return result;
            },
            /**
             * Make requst to the server using IO object.
             * @memberof WEBSPELLCHECKER.Connection#
             *
             * @param {Object} parameters - Wrapped requst parameters.
             * @param {Function} onSuccess - Handler successful response from the server.
             * @param {Function} onError - Handler unsuccessful response from the server.
             *
             * @returns {Object} - Transport object.
             * @private
             */
            request: function(parameters, onSuccess, onError) {
                return IO.get(
                    this.getURL()
                        .addParameters( this.prepareParameters(parameters, _parametersMap) )
                        .addMetaParameters( this.defaultMetaParameters ),
                    this.withCredentials,
                    this.requestHeaders,
                    onSuccess,
                    onError
                );
            }
        };

        Namespace.Connection = Connection;
    }

    if(typeof window === 'undefined') {module.exports = init;}
	if(typeof WEBSPELLCHECKER !== 'undefined' && !('Connection' in WEBSPELLCHECKER)) {init(WEBSPELLCHECKER);}
})();