// Connection.js
/**
 * @fileoverview Connection module.
 */
(function(){
    'use strict';
	function init( Namespace ) {

        var IO = Namespace.IO,
            _parametersMap = {
                customer_id: 'customerid',
                command: 'cmd',
                communicationFormat: 'format',
                userDictionary: 'user_dictionary',
                customDictionary: 'custom_dictionary',
                UDAction: 'action',
                UDName: 'name',
                newUDName: 'new_name',
                removeUDCookie: 'remove_ud_cookie',
                UDWord: 'word',
                wordList: 'wordlist',
                language: 'slang',
                outType: 'out_type',
                text: 'text',
                sentences: 'sentences'
            },
            _commandsMap = {
                spellCheck: 'check_spelling',
                grammarCheck: 'grammar_check',
                userDictionary: 'user_dictionary',
                getLangList: 'get_lang_list'
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
         * Connection constructor.
         * Module for working with server commands and preparing request info.
         * @constructor
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

            this.defaultParameters = {};
            this.setDefaultParameters();
        }

        Connection.prototype = {
            constructor: Connection,
            /**
             * Accessor for map of cmd request parameter values.
             * 
             * @returns {Object} - List of server commands.
             * @private
             */ 
            getCommands: function() {
                return _commandsMap;
            },
            /**
             * Accessor for map of user dictionary actions.
             * 
             * @returns {Object} - List of UD actions.
             * @private
             */ 
            getUDActions: function() {
                return _UDActionsMap;
            },
            /**
             * Define common parameters for each request.
             * 
             * @private
             */ 
            setDefaultParameters: function() {
                this.defaultParameters[_parametersMap.customer_id] = this.appInstance.getOption('customerId');
                this.defaultParameters[_parametersMap.communicationFormat] = this.appInstance.getOption('communicationFormat');
            },
            /**
             * Return clone of url object for request.
             * 
             * @returns {Object} - Clone of IO url object.
             * @private
             */
            getURL: function() {
                return Object.assign({}, this.url);
            },
            /**
             * Prepare client parameters before request.
             * Collect request parameters from _parametersMap.
             * 
             * @param {Object} parameters - Wrapped requst parameters.
             * 
             * @returns {Object} - Requst parameters.
             * @private
             */
            prepareParameters: function(parameters) {
                var result = {},
                    paramName;

                for(var k in parameters) {
                    paramName = _parametersMap[k];
                    if(!paramName) {
                        throw new Error('parameter ' + k + ' is not specified.');
                    }
                    result[paramName] = parameters[k];
                }
                result = Object.assign({}, this.defaultParameters, result);

                // Now we have the bag with get_lang_list command.
                // It's doesn't work for some reasons with "format=json" parameter.
                if(result[_parametersMap.command] === _commandsMap.getLangList) {
                    delete result[_parametersMap.communicationFormat];
                }

                return result;
            },
            /**
             * Make requst to the server using IO object.
             * 
             * @param {Object} parameters - Wrapped requst parameters.
             * @param {Object} onSuccess - Handler successful response from the server.
             * @param {Object} onError - Handler unsuccessful response from the server.
             * 
             * @returns {Object} - Transport object.
             * @private
             */
            request: function(parameters, onSuccess, onError) {
                return IO.get(
                    this.getURL()
                        .addParameters( this.prepareParameters(parameters) ),
                    onSuccess,
                    onError
                );
            }
        };

        Namespace.Connection = Connection;
    }

    if(typeof window === 'undefined') {module.exports = init;}
	if(typeof WEBSPELLCHECKER !== 'undefined') {init(WEBSPELLCHECKER);}
})();