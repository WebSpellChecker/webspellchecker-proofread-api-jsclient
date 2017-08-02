
(function(){
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
     * Represents a Namespace (WEBSPELLCHECKER).
     * @constructor
     * @instance
     * @public
     * @param {Object} clientOptions
     
    * @param {string} [options.lang='en_US'] - The parameter sets the default spell checking language for SCAYT. Possible values are:
    * 'en_US', 'en_GB', 'pt_BR', 'da_DK',
    * 'nl_NL', 'en_CA', 'fi_FI', 'fr_FR',
    * 'fr_CA', 'de_DE', 'el_GR', 'it_IT',
    * 'nb_NO', 'pt_PT', 'es_ES', 'sv_SE'.
    *
    * @param {string} [options.serviceProtocol='http'] - The parameter allows to specify protocol for WSC service (entry point is ssrv.cgi) full path.
    *
    * @param {string} [options.serviceHost='svc.webspellchecker.net'] - The parameter allows to specify host for WSC service (entry point is ssrv.cgi) full path.
    *
    * @param {number} [options.servicePort='80'] - The parameter allows to specify default port for WSC service (entry point is ssrv.cgi) full path.
    *
    * @param {string} [options.servicePath='spellcheck31/script/ssrv.cgi'] - The parameter allows to specify path for WSC service (entry point is ssrv.cgi) full path.
    *
    * @param {number} [options.minWordLength=4] - The parameter defines minimum length of the letters that will be collected from container's text for spell checking.
    * Possible value is any positive number.
    *
    * @param {string} [options.customDictionaryIds=''] - The parameter links SCAYT to custom dictionaries. Here is a string containing dictionary IDs separated by commas (',').
    * Further details can be found at [http://wiki.webspellchecker.net/doku.php?id=installationandconfiguration:customdictionaries:licensed](http://wiki.webspellchecker.net/doku.php?id=installationandconfiguration:customdictionaries:licensed).
    *
    * @param {string} [options.userDictionaryName=''] - The parameter activates a User Dictionary in SCAYT.
    *
    * @param {string} [options.customerId='1:j47ai-r4SLN1-dG5xP1-UuonU-WqXUZ3-0bzqZ1-QI8OP1-bQZcb1-KQuPE3-nWbcY3-aA4Zk4-wT9'] - The parameter sets the customer ID for SCAYT. It used for a migration from free,
    * ad-supported version to paid, ad-free version.
    *
    * @param {string} [options.customPunctuation='-'] - The parameter that receives a string with characters that will considered as separators.
    */
    var WEBSPELLCHECKER = glob.WEBSPELLCHECKER =  function(clientOptions) {

        // Static dependencies
        var OptionsProcessor =  WEBSPELLCHECKER.OptionsProcessor,
            logger = WEBSPELLCHECKER.logger;

        // Variables
        var  _options, _optionTypes, _optionsTemplate,
            _dependencies, _services = {},
            connection, textProcessor,
            commands,
            userDictionaryManager,
            self = this;

        // options creation
        _optionTypes = OptionsProcessor.optionTypes;
        _optionsTemplate = {
            lang: {
                type: _optionTypes.string,
                defaultValue: 'en_US'
            },
            serviceProtocol: {
                type: _optionTypes.url_protocol,
                defaultValue: 'http'
            },
            serviceHost: {
                type: _optionTypes.url_host,
                defaultValue: 'svc.webspellchecker.net'
            },
            servicePort: {
                type: _optionTypes.url_port,
                defaultValue: 80
            },
            servicePath: {
                type: _optionTypes.url_path,
                defaultValue: 'spellcheck31/script/ssrv.cgi'
            },
            customer_id: {
                type: _optionTypes.string,
                defaultValue: '1:KpkvQ2-6KNUj-L1W3u2-C9j0K1-Zv2tY1-CfDOx-WfGRg2-qXtci-YyyE34-j09H42-b0aCt3-d9a'
            },
            userDictionaryName: {
                type: _optionTypes.string,
                defaultValue: undefined
            },
            customDictionary: {
                type: _optionTypes.string,
                defaultValue: undefined
            },
            minWordLength: {
                type: _optionTypes.number,
                defaultValue: 4
            },
            communicationFormat: {
                type: _optionTypes.string,
                defaultValue: 'json'
            },
            customPunctuation: {
                type: _optionTypes.string,
                defaultValue: ''
            }
        };
        _options = OptionsProcessor.createOptions(clientOptions, _optionsTemplate, function errorHandler(errors) {
            errors.reports.forEach(function(report) {
                logger.log(report.message);
            }, this);
        });

        // Private
        /**
         * Return instance of dependencie.
         *
         * @param {string} name - Name of instancebased service.
         *
         * @returns {object} - Instance of service.
         */
        this._getService = function(name) {
            return _services[name] || null;
        };

        /**
         * Wrapper of request method.
         * @private
         * 
         * @param {object} data - Object with request data.
         * @param {function} success - Handler successful response from the server.
	     * @param {function} error - Handler unsuccessful response from the server.
         *
         * @returns {object} - Transport object.
         */
        this._request = function(data, success, error) {
            return connection.request(
                data,
                success,
                error
            );
        };

        // Accessors
        this.getOption = function(name) {
            return _options[name];
        };
        this.setOption = function(name, value) {
            var result = false,
                template = _optionsTemplate[name];
            if(template) {
                result = true;
                _options[name] = OptionsProcessor.createOption({
                    name: name,
                    value: value,
                    template: template,
                    errorHandler: function(errorReport) {
                        logger.log(errorReport.message);
                        result = false;
                    }
                });
            }
            return result;
        };

        // Instancebased dependencies
        _dependencies = {
            'TextProcessor': WEBSPELLCHECKER.TextProcessor,
            'Connection': WEBSPELLCHECKER.Connection
        };

        for (var k in _dependencies) {
            _services[k] = new _dependencies[k](k, this);
        }

        connection = _services['Connection'];
        textProcessor = _services['TextProcessor'];
        commands = connection.getCommands();

        /**
         * UserDictionary Manager constructor.
         * Encapsulates the construction of a query for UD request.
         * @private
         * @constructor
	     *
	     * @param {object} parametrs.actions        - List of available UD actions.
         * @param {function} parametrs.request  	- Request-maker function.
	     */
        function UserDictionaryManager(parametrs) {
            this.actions = parametrs.actions;
            this.request = parametrs.request;
        }

        UserDictionaryManager.prototype = {
            constructor: UserDictionaryManager,
            /**
             * @private
             * UserDictionaryManager entrypoint.
             * Controller for UD actions.
             * @param {string} actionName           - Name of UD action .
             * @param {function} parametrs.request  - Request-maker function.
             *
             * @returns {object}                    - Transport object.
             */
            action: function(actionName, parametrs) {
                var actionMethod = this[actionName],
                    UDName =  parametrs.name,
                    requestParametrs;

                requestParametrs = Object.assign( {
                    // UDName common parameter for any request.
                    UDName: UDName
                }, actionMethod.call(this, parametrs) );

                return this.request(
                    requestParametrs,
                    parametrs.success,
                    parametrs.error
                );
            },
            /**
             * @private
             * UserDictionaryManager 'get' method.
             *
             * @returns {object} - Object with UD 'get' action.
             */
            get: function() {
                return {
                    UDAction: this.actions.getDict
                };
            },
            /**
             * @private
             * UserDictionaryManager 'create' method.
             * Receive list of words what will be added to the new dicrionary.
             *
             * @param {string} parametrs.wordList - List of words separated by ','.
             *
             * @returns {object} - Object with UD 'create' action and wordLists parametr.
             */
            create: function(parametrs) {
                return {
                    UDAction: this.actions.create,
                    wordList: parametrs.wordList || ''
                };
            },
            /**
             * @private
             * UserDictionaryManager 'delete' method.
             *
             * @returns {object} - Object with UD 'delete' action.
             */
            'delete': function() {
               return {
                    // Used reflection notation because in IE8 we can't create field named 'delete'.
                    UDAction: this.actions['delete']
                };
            },
            /**
             * @private
             * UserDictionaryManager 'rename' method.
             * Receive new dictionary name.
             *
             * @param {string} parametrs.newName - Name of new dictionary.
             *
             * @returns {object} - Object with UD 'rename' action and new UD name.
             */
            rename: function(parametrs) {
                return {
                    UDAction: this.actions.rename,
                    newUDName: parametrs.newName
                };
            },
            /**
             * @private
             * UserDictionaryManager 'addWord' method.
             * Receive word what will be added to dictionary.
             *
             * @param {string} parametrs.word - Word.
             *
             * @returns {object} - Object with UD 'addWord' action and word.
             */
            addWord: function(parametrs) {
                return {
                    UDAction: this.actions.addWord,
                    UDWord: parametrs.word
                };
            },
            /**
             * @private 
             * UserDictionaryManager 'deleteWord' method.
             * Receive word what will be deleted from dictionary.
             *
             * @param {string} parametrs.word - Word.
             *
             * @returns {object} - Object with UD 'deleteWord' action and word.
             */
            deleteWord: function(parametrs) {
                return {
                    UDAction: this.actions.deleteWord,
                    UDWord: parametrs.word
                };
            }
        };

        userDictionaryManager = new UserDictionaryManager({
            actions: connection.getUDActions(),
            request: function(parametrs) {
                parametrs.command = commands.userDictionary;
                return self._request.apply(this, arguments);
            }
        });

        // API
        /**
         * getLangList success Callback.
         *
         * @callback getLangListCallback
         * @param {object} data.langList - Object with list of available languages. Separeted on ltr(left-to-right) and rtl(right-to-left) directions.
         * @param {number} data.verLang - Number of available languages.
         */

        /**
         * getLangList API method.
         *
         * @param {getLangListCallback} parametrs.success - Handler successful response from the server.
         * @param {requestCallback} parametrs.error - Handler unsuccessful response from the server. 
         * @returns {object} - Transport object.
         * @example
         * wscWebApiInstance.getLangList({
         *      success: function(data) {
         *          console.log(data); // {"langList":{"ltr":{"en_US" : "American English","en_GB" : "British English","fr_FR" : "French","de_DE" : "German","it_IT" : "Italian","es_ES" : "Spanish"},"rtl":{}},"verLang":9}
         *      },
         *      error: function(error) {
         *          console.log(error);
         *      }
         * })
         */
        this.getLangList = function(parametrs) {
            return this._request(
                {
                    command: commands.getLangList
                },
                parametrs.success,
                parametrs.error
            );
        };
        /**
         * spellCheck success Callback.
         *
         * @callback spellCheckCallback
         * @param {Array.<Object>} wordObjects.word - misspelled word.
         * @param {Array.<Object>} wordObjects.ud - flag. Is this word in the dictionary.
         * @param {Array.<Object>} wordObjects.suggestions - array with suggestions for current misspelled.
         */

        /**
         * spellCheck API method.
         *
         * @param {string} parametrs.text - Text to check spelling.
         * @param {spellCheckCallback} parametrs.success - Handler successful response from the server.
         * @param {requestCallback} parametrs.error - Handler unsuccessful response from the server.
         * @returns {object} - Transport object.
         * @example
         * wscWebApiInstance.spellCheck({
         *      text: 'This is an exampl of a sentence with two mispelled words. Just type text with misspelling to see how it works',
         *      success: function(data) {
         *          console.log(data); // [{"word":"exampl","ud":"false","suggestions":["example","examples","exempla","exam","exemplar","exemplum","resample","exemplars","exemplary","exemplify","exempt","exams","xml","decamp","beanpole"]},{"word":"mispelled","ud":"false","suggestions":["misspelled","dispelled","impelled","misspell","miscalled","misspells","misplaced","misplayed","respelled","morseled","micelle","Giselle","misapplied","misspelt","installed"]}]
         *      },
         *      error: function(error) {
         *          console.log(error);
         *      }
         * });
         */
        this.spellCheck = function(parametrs) {
            var words = textProcessor.getWordsFromString( parametrs.text ),
                text = words.wordsCollection.join(',');

            function addOffsetsToMisspelled(data, offsets) {
                var misspelled;
                return offsets.reduce(function(prev, offsetsObj) {
                    for(var i = 0; i < data.length; i += 1) {
                        misspelled = data[i];
                        if(misspelled.word === offsetsObj.word) {
                            prev.push( Object.assign(
                                {},
                                misspelled,
                                offsetsObj
                            ) );
                            return prev;
                        }
                    }
                    return prev;
                }, []);
            }
            return this._request(
                {
                    command: commands.spellCheck,
                    language:  this.getOption('lang'),
                    customDictionary: this.getOption('customDictionary'),
                    userDictionary: this.getOption('userDictionaryName'),
                    text: text
                },
                function onSuccess(data) {
                    var misspelledsWithOffsets = addOffsetsToMisspelled(data, words.wordsOffsets);
                    parametrs.success(misspelledsWithOffsets);
                },
                parametrs.error
            );
        };
        /**
         * grammarCheck success Callback.
         *
         * @callback grammarCheckCallback
         * @param {Array.<Object>} phraseObjects.description - description of grammar problem.
         * @param {Array.<Object>} phraseObjects.phrase - phrase with problem.
         * @param {Array.<Object>} phraseObjects.problem_id - id of current problem.
         * @param {Array.<Object>} phraseObjects.suggestions - array with suggestions.
         */

        /**
         * grammarCheck API method.
         *
         * @param {string} parametrs.text - Text to grammar checking.
         * @param {grammarCheckCallback} parametrs.success - Handler successful response from the server.
         * @param {requestCallback} parametrs.error - Handler unsuccessful response from the server.
         * @returns {object} - Transport object.
         * @example
         * wscWebApiInstance.grammarCheck({
         *      text: 'These are an examples of a sentences with two misspelled words and gramar problems. Just type text with mispelling to see how it works.',
         *      success: function(data) {
         *          console.log(data); // [{"phrase":"type text","description":"Missing preposition.","problem_id":"436864176","suggestions":["type of text"]}]
         *      },
         *      error: function(error) {
         *          console.log(error);
         *      }
         * });
         */
        this.grammarCheck = function(parametrs) {
            return this._request(
                {
                    command: commands.grammarCheck,
                    language:  this.getOption('lang'),
                    text: parametrs.text
                },
                parametrs.success,
                parametrs.error
            );
        };
        /** 
         * userDictionary success Callback.
         *
         * @callback userDictionaryCallback
         * @param {string} UDResponse.name - Dictionary name.
         * @param {string} UDResponse.action - User Dictionary action.
         * @param {Object} wordObjects.wordlist - lsit of words stored in this dictionary.
         */

        /**
         * getUserDictionary API method.
         *
         * @param {string} parametrs.name - User dictionary name.
         * @param {userDictionaryCallback} parametrs.success - Handler successful response from the server.
         * @param {requestCallback} parametrs.error - Handler unsuccessful response from the server.
         * @returns {object} - Transport object.
         * @example
         * wscWebApiInstance.getUserDictionary({
         *      name: 'test',
         *      success: function(data) {
         *          console.log(data); // {"name":"test","action":"getdict","wordlist":[]}
         *      },
         *      error: function(error) {
         *          console.log(error);
         *      }
         * });
         */
        this.getUserDictionary = function(parametrs) {
            return userDictionaryManager.action('get', parametrs);
        };
        

        /**
         * createUserDictionary API method.
         *
         * @param {string} parametrs.name - User dictionary name.
         * @param {userDictionaryCallback} parametrs.success - Handler successful response from the server.
         * @param {requestCallback} parametrs.error - Handler unsuccessful response from the server.
         * @returns {object} - Transport object.
         * @example
         * wscWebApiInstance.createUserDictionary({
         *      name: 'test',
         *      success: function(data) {
         *          console.log(data); // {"name":"test","action":"create","wordlist":[]}
         *      },
         *      error: function(error) {
         *          console.log(error);
         *      }
         * });
         */
        this.createUserDictionary = function(parametrs) {
            return userDictionaryManager.action('create', parametrs);
        };
        
        /**
         * deleteUserDictionary API method.
         *
         * @param {string} parametrs.name - User dictionary name.
         * @param {userDictionaryCallback} parametrs.success - Handler successful response from the server.
         * @param {requestCallback} parametrs.error - Handler unsuccessful response from the server.
         * @returns {object} - Transport object.
         * @example
         * wscWebApiInstance.deleteUserDictionary({
         *      name: 'test',
         *      success: function(data) {
         *          console.log(data); // {"name":"test","action":"delete","wordlist":[]}
         *      },
         *      error: function(error) {
         *          console.log(error);
         *      }
         * });
         */
        this.deleteUserDictionary = function(parametrs) {
            return userDictionaryManager.action('delete', parametrs);
        };

        /**
         * renameUserDictionary API method.
         *
         * @param {string} parametrs.name - User dictionary name.
         * @param {string} parametrs.newName - new User dictionary name.
         * @param {userDictionaryCallback} parametrs.success - Handler successful response from the server.
         * @param {requestCallback} parametrs.error - Handler unsuccessful response from the server.
         * @returns {object} - Transport object.
         * @example
         * wscWebApiInstance.renameUserDictionary({
         *      name: 'test',
         *      success: function(data) {
         *          console.log(data); // {"name":"test","action":"rename","wordlist":[]}
         *      },
         *      error: function(error) {
         *          console.log(error);
         *      }
         * });
         */
        this.renameUserDictionary = function(parametrs) {
            return userDictionaryManager.action('rename' , parametrs);
        };

        /**
         * addWordToUserDictionary API method.
         *
         * @param {string} parametrs.name - User dictionary name.
         * @param {string} parametrs.word - Word what will be added to UD.
         * @param {userDictionaryCallback} parametrs.success - Handler successful response from the server.
         * @param {requestCallback} parametrs.error - Handler unsuccessful response from the server.
         * @returns {object} - Transport object.
         * @example
         * wscWebApiInstance.addWordToUserDictionary({
         *      name: 'test',
         *      word: 'exaple',
         *      success: function(data) {
         *          console.log(data); // {"name":"test","action":"addword","wordlist":[]}
         *      },
         *      error: function(error) {
         *          console.log(error);
         *      }
         * });
         */
        this.addWordToUserDictionary = function(parametrs) {
            return userDictionaryManager.action('addWord', parametrs);
        };

        /**
         * deleteWordFromUserDictionary API method.
         *
         * @param {string} parametrs.name - User dictionary name.
         * @param {string} parametrs.word - Word what will be deleted from UD.
         * @param {userDictionaryCallback} parametrs.success - Handler successful response from the server.
         * @param {requestCallback} parametrs.error - Handler unsuccessful response from the server.
         * @returns {object} - Transport object.
         * @example
         * wscWebApiInstance.deleteWordFromUserDictionary({
         *      name: 'test',
         *      word: 'exaple',
         *      success: function(data) {
         *          console.log(data); // {"name":"test","action":"deleteword","wordlist":[]}
         *      },
         *      error: function(error) {
         *          console.log(error);
         *      }
         * });
         */
        this.deleteWordFromUserDictionary = function(parametrs) {
            return userDictionaryManager.action('deleteWord', parametrs);
        };
    };

    WEBSPELLCHECKER.env = env;
    WEBSPELLCHECKER.envTypes = envTypes;
    WEBSPELLCHECKER.isNamespace = true;

    if(env === envTypes.node) {
        module.exports = WEBSPELLCHECKER;
    }
})();