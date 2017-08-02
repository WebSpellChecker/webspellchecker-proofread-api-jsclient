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


        function Connection(moduleId, appInstance) {
            this.moduleId = moduleId;
            this.appInstance = appInstance;
            this.url = new IO.URL({
				protocol 	: appInstance.getOption('service_protocol'),
				host 		: appInstance.getOption('service_host'),
				port 		: appInstance.getOption('service_port'),
				path 		: appInstance.getOption('service_path')
            });

            this.defaultParameters = {};
            this.setDefaultParameters();
        }

        Connection.prototype = {
            getCommands: function() {
                return _commandsMap;
            },
            getUDActions: function() {
                return _UDActionsMap;
            },
            setDefaultParameters: function() {
                this.defaultParameters[_parametersMap.customer_id] = this.appInstance.getOption('customer_id');
                this.defaultParameters[_parametersMap.communicationFormat] = this.appInstance.getOption('communicationFormat');
            },
            getURL: function() {
                return Object.assign({}, this.url);
            },
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