// webapi.js
/**
 * @namespace WEBSPELLCHECKER
 */
(function(){
    function init( Namespace ) {
        // Private
        var OptionsManager = Namespace.OptionsManager,
            logger = Namespace.logger,
            optionTypes = OptionsManager.optionTypes,
            optionsTemplate;

        optionsTemplate = {
            lang: {
                type: optionTypes.string,
                defaultValue: 'en_US'
            },
            serviceProtocol: {
                type: optionTypes.url_protocol,
                defaultValue: 'http'
            },
            serviceHost: {
                type: optionTypes.url_host,
                defaultValue: 'svc.webspellchecker.net'
            },
            servicePort: {
                type: optionTypes.url_port,
                defaultValue: 80
            },
            servicePath: {
                type: optionTypes.url_path,
                defaultValue: 'spellcheck31/script/ssrv.cgi'
            },
            customerId: {
                type: optionTypes.string,
                defaultValue: '1:KpkvQ2-6KNUj-L1W3u2-C9j0K1-Zv2tY1-CfDOx-WfGRg2-qXtci-YyyE34-j09H42-b0aCt3-d9a'
            },
            userDictionaryName: {
                type: optionTypes.string,
                defaultValue: undefined
            },
            customDictionary: {
                type: optionTypes.string,
                defaultValue: undefined
            },
            minWordLength: {
                type: optionTypes.number,
                defaultValue: 4
            },
            communicationFormat: {
                type: optionTypes.string,
                defaultValue: 'json'
            },
            customPunctuation: {
                type: optionTypes.string,
                defaultValue: ''
            },
            metaParameters: {
                type: optionTypes.object,
                defaultValue: {
                    appType: 'webapi'
                }
            }
        };

        /**
         * @constructor
         * @param {Object} clientOptions
         * @private
         */
        function WebApi(clientOptions) {
            var self = this;
            this._services = {};
            // options creation
            this._options = OptionsManager.createOptions(clientOptions, optionsTemplate, function errorHandler(errors) {
                errors.reports.forEach(function(report) {
                    logger.log(report.message);
                }, this);
            });

            // Instancebased dependencies
            this._dependencies = {
                'TextProcessor': Namespace.TextProcessor,
                'Connection': Namespace.Connection
            };

            for (var k in this._dependencies) {
                this._services[k] = new this._dependencies[k](k, this);
            }

            var connection = this._services['Connection'],
                commands = connection.getCommands();
            this._commands = commands;

            this._userDictionaryManager = new UserDictionaryManager({
                actions: connection.getUDActions(),
                request: function(parametrs) {
                    parametrs.command = commands.userDictionary;
                    return self._request.apply(self, arguments);
                }
            });
        }

        /**
         * @namespace WebApiInstance
         */
        WebApi.prototype = {
            constructor: WebApi,
            // Private
            /**
             * Return instance of dependencie.
             *
             * @param {String} name - Name of instancebased service.
             *
             * @returns {Object} - Instance of service.
             */
            _getService: function(name) {
                return this._services[name] || null;
            },
            /**
             * Wrapper of request method.
             * @private
             *
             * @param {Object} data - Object with request data.
             * @param {function} success - Handler successful response from the server.
             * @param {function} error - Handler unsuccessful response from the server.
             *
             * @returns {Object} - Transport object.
             */
            _request: function(data, success, error) {
                return this._getService('Connection').request(
                    data,
                    success,
                    error
                );
            },
            // Accessors
            getOption: function(name) {
                return this._options[name];
            },
            setOption: function(name, value) {
                var result = false,
                    template = optionsTemplate[name];
                if(template) {
                    result = true;
                    this._options[name] = OptionsManager.createOption({
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
            },
            // API
            /**
             * getLangList success Callback.
             *
             * @callback GetLangListCallback
             * @param {Object} data
             * @param {Object} [data.langList={"ltr":{"en_US" : "American English","en_GB" : "British English","fr_FR" : "French","de_DE" : "German","it_IT" : "Italian","es_ES" : "Spanish"},"rtl":{}}]
             *      Object with list of available languages. Separeted on ltr(left-to-right) and rtl(right-to-left) directions.
             * @param {Number} [data.verLang=9] Number of available languages.
             */

            /**
             * getLangList API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parametrs
             * @param {GetLangListCallback} parametrs.success - Handler successful response from the server.
             * @param {RequestCallback} parametrs.error - Handler unsuccessful response from the server.
             * @returns {Object} - Transport object.
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
            getLangList: function(parametrs) {
                return this._request(
                    {
                        command: this._commands.getLangList
                    },
                    parametrs.success,
                    parametrs.error
                );
            },
            /**
             * spellCheck success Callback.
             *
             * @callback SpellCheckCallback
             * @param {Object[]} wordObjects
             * @param {String} wordObjects.word - Misspelled word.
             * @param {String} wordObjects.ud - Flag. Is this word in the user dictionary.
             * @param {String[]} wordObjects.suggestions - Array with suggestions for current misspelled.
             */

            /**
             * spellCheck API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parametrs
             * @param {String} parametrs.text - Text to check spelling.
             * @param {String} parametrs.lang - Spellcheck language. If not provided then take from constructor.
             * @param {SpellCheckCallback} parametrs.success - Handler successful response from the server.
             * @param {RequestCallback} parametrs.error - Handler unsuccessful response from the server.
             * @returns {Object} - Transport object.
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
            spellCheck: function(parametrs) {
                var words = this._getService('TextProcessor').getWordsFromString( parametrs.text ),
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
                        command: this._commands.spellCheck,
                        language:  parametrs.lang || this.getOption('lang'),
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
            },
            /**
             * grammarCheck success Callback.
             *
             * @callback GrammarCheckCallback
             * @param {Object[]} phraseObjects
             * @param {String} phraseObjects.description - Description of grammar problem.
             * @param {String} phraseObjects.phrase - Phrase with problem.
             * @param {Number} phraseObjects.problem_id - Id of current problem.
             * @param {String[]} phraseObjects.suggestions - Array with suggestions.
             */

            /**
             * grammarCheck API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parametrs
             * @param {String} parametrs.text - Text to grammar checking.
             * @param {String} parametrs.lang - Grammarcheck language. If not provided then take from constructor.
             * @param {GrammarCheckCallback} parametrs.success - Handler successful response from the server.
             * @param {RequestCallback} parametrs.error - Handler unsuccessful response from the server.
             * @returns {Object} - Transport object.
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
            grammarCheck: function(parametrs) {
                return this._request(
                    {
                        command: this._commands.grammarCheck,
                        language: parametrs.lang || this.getOption('lang'),
                        text: parametrs.text
                    },
                    parametrs.success,
                    parametrs.error
                );
            },
            /**
             * userDictionary success Callback.
             *
             * @callback UserDictionaryCallback
             * @param {Object} UDResponse
             * @param {String} UDResponse.name - Dictionary name.
             * @param {String} UDResponse.action - User Dictionary action.
             * @param {Object} UDResponse.wordlist - List of words stored in this dictionary.
             */

            /**
             * getUserDictionary API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parametrs
             * @param {String} parametrs.name - User dictionary name.
             * @param {UserDictionaryCallback} parametrs.success - Handler successful response from the server.
             * @param {RequestCallback} parametrs.error - Handler unsuccessful response from the server.
             * @returns {Object} - Transport object.
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
            getUserDictionary: function(parametrs) {
                return this._userDictionaryManager.action('get', parametrs);
            },
            /**
             * createUserDictionary API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parametrs
             * @param {String} parametrs.name - User dictionary name.
             * @param {UserDictionaryCallback} parametrs.success - Handler successful response from the server.
             * @param {RequestCallback} parametrs.error - Handler unsuccessful response from the server.
             * @returns {Object} - Transport object.
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
            createUserDictionary: function(parametrs) {
                return this._userDictionaryManager.action('create', parametrs);
            },
            /**
             * deleteUserDictionary API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parametrs
             * @param {String} parametrs.name - User dictionary name.
             * @param {UserDictionaryCallback} parametrs.success - Handler successful response from the server.
             * @param {RequestCallback} parametrs.error - Handler unsuccessful response from the server.
             * @returns {Object} - Transport object.
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
            deleteUserDictionary: function(parametrs) {
                return this._userDictionaryManager.action('delete', parametrs);
            },
            /**
             * renameUserDictionary API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parametrs
             * @param {String} parametrs.name - User dictionary name.
             * @param {String} parametrs.newName - New user dictionary name.
             * @param {UserDictionaryCallback} parametrs.success - Handler successful response from the server.
             * @param {RequestCallback} parametrs.error - Handler unsuccessful response from the server.
             * @returns {Object} - Transport object.
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
            renameUserDictionary: function(parametrs) {
                return this._userDictionaryManager.action('rename' , parametrs);
            },
            /**
             * addWordToUserDictionary API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parametrs
             * @param {String} parametrs.name - User dictionary name.
             * @param {String} parametrs.word - Word what will be added to UD.
             * @param {UserDictionaryCallback} parametrs.success - Handler successful response from the server.
             * @param {RequestCallback} parametrs.error - Handler unsuccessful response from the server.
             * @returns {Object} - Transport object.
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
            addWordToUserDictionary: function(parametrs) {
                return this._userDictionaryManager.action('addWord', parametrs);
            },
            /**
             * deleteWordFromUserDictionary API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parametrs
             * @param {String} parametrs.name - User dictionary name.
             * @param {String} parametrs.word - Word what will be deleted from UD.
             * @param {UserDictionaryCallback} parametrs.success - Handler successful response from the server.
             * @param {RequestCallback} parametrs.error - Handler unsuccessful response from the server.
             * @returns {Object} - Transport object.
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
            deleteWordFromUserDictionary: function(parametrs) {
                return this._userDictionaryManager.action('deleteWord', parametrs);
            }
        };

        /**
         * @constructor
         * UserDictionary Manager constructor.
         * Encapsulates the construction of a query for UD request.
         *
         * @param {Object} parametrs.actions        - List of available UD actions.
         * @param {function} parametrs.request  	- Request-maker function.
         * @private
         */
        function UserDictionaryManager(parametrs) {
            this.actions = parametrs.actions;
            this.request = parametrs.request;
        }

        UserDictionaryManager.prototype = {
            constructor: UserDictionaryManager,
            /**
             * UserDictionaryManager entrypoint.
             * Controller for UD actions.
             * @param {String} actionName           - Name of UD action .
             * @param {function} parametrs.request  - Request-maker function.
             *
             * @returns {Object}                    - Transport object.
             * @private
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
             * UserDictionaryManager 'get' method.
             *
             * @returns {Object} - Object with UD 'get' action.
             * @private
             */
            get: function() {
                return {
                    UDAction: this.actions.getDict
                };
            },
            /**
             * UserDictionaryManager 'create' method.
             * Receive list of words what will be added to the new dicrionary.
             *
             * @param {String} parametrs.wordList - List of words separated by ','.
             *
             * @returns {Object} - Object with UD 'create' action and wordLists parametr.
             * @private
             */
            create: function(parametrs) {
                return {
                    UDAction: this.actions.create,
                    wordList: parametrs.wordList || ''
                };
            },
            /**
             * UserDictionaryManager 'delete' method.
             *
             * @returns {Object} - Object with UD 'delete' action.
             * @private
             */
            'delete': function() {
                return {
                    // Used reflection notation because in IE8 we can't create field named 'delete'.
                    UDAction: this.actions['delete']
                };
            },
            /**
             * UserDictionaryManager 'rename' method.
             * Receive new dictionary name.
             *
             * @param {String} parametrs.newName - Name of new dictionary.
             *
             * @returns {Object} - Object with UD 'rename' action and new UD name.
             * @private
             */
            rename: function(parametrs) {
                return {
                    UDAction: this.actions.rename,
                    newUDName: parametrs.newName
                };
            },
            /**
             * UserDictionaryManager 'addWord' method.
             * Receive word what will be added to dictionary.
             *
             * @param {String} parametrs.word - Word.
             *
             * @returns {Object} - Object with UD 'addWord' action and word.
             * @private
             */
            addWord: function(parametrs) {
                return {
                    UDAction: this.actions.addWord,
                    UDWord: parametrs.word
                };
            },
            /**
             * UserDictionaryManager 'deleteWord' method.
             * Receive word what will be deleted from dictionary.
             *
             * @param {String} parametrs.word - Word.
             *
             * @returns {Object} - Object with UD 'deleteWord' action and word.
             * @private
             */
            deleteWord: function(parametrs) {
                return {
                    UDAction: this.actions.deleteWord,
                    UDWord: parametrs.word
                };
            }
        };
        /**
         * Method check client options and return WebApi instance.
         * @memberof WEBSPELLCHECKER
         * @method WEBSPELLCHECKER.initWebApi
         * @param {Object} clientOptions
         * @param {String} [clientOptions.lang='en_US'] - The parameter sets the default spell checking language for SCAYT. Possible values are:
         * 'en_US', 'en_GB', 'pt_BR', 'da_DK',
         * 'nl_NL', 'en_CA', 'fi_FI', 'fr_FR',
         * 'fr_CA', 'de_DE', 'el_GR', 'it_IT',
         * 'nb_NO', 'pt_PT', 'es_ES', 'sv_SE'.
         *
         * @param {String} [clientOptions.serviceProtocol='http'] - The parameter allows to specify protocol for WSC service (entry point is ssrv.cgi) full path.
         *
         * @param {String} [clientOptions.serviceHost='svc.webspellchecker.net'] - The parameter allows to specify host for WSC service (entry point is ssrv.cgi) full path.
         *
         * @param {Number} [clientOptions.servicePort='80'] - The parameter allows to specify default port for WSC service (entry point is ssrv.cgi) full path.
         *
         * @param {String} [clientOptions.servicePath='spellcheck31/script/ssrv.cgi'] - The parameter allows to specify path for WSC service (entry point is ssrv.cgi) full path.
         *
         * @param {Number} [clientOptions.minWordLength=4] - The parameter defines minimum length of the letters that will be collected from container's text for spell checking.
         * Possible value is any positive number.
         *
         * @param {String} [clientOptions.customDictionaryIds=''] - The parameter links SCAYT to custom dictionaries. Here is a string containing dictionary IDs separated by commas (',').
         * Further details can be found at [http://wiki.webspellchecker.net/doku.php?id=installationandconfiguration:customdictionaries:licensed](http://wiki.webspellchecker.net/doku.php?id=installationandconfiguration:customdictionaries:licensed).
         *
         * @param {String} [clientOptions.userDictionaryName=''] - The parameter activates a User Dictionary in SCAYT.
         *
         * @param {String} [clientOptions.customerId='1:KpkvQ2-6KNUj-L1W3u2-C9j0K1-Zv2tY1-CfDOx-WfGRg2-qXtci-YyyE34-j09H42-b0aCt3-d9a'] - The parameter sets the customer ID for SCAYT. It used for a migration from free,
         * ad-supported version to paid, ad-free version.
         *
         * @param {String} [clientOptions.customPunctuation=''] - The parameter that receives a string with characters that will considered as separators.
         * @returns {Object} - WebApi Instance.
         */
        Namespace.initWebApi = function(clientOptions) {
            var options, isErrorsCritical;

            options = OptionsManager.createOptions(clientOptions, optionsTemplate, function errorHandler(errors) {
                isErrorsCritical = errors.critical;
                errors.reports.forEach(function(report) {
                    logger.log(report.message);
                }, this);
            });
            if(isErrorsCritical !== true) {
                return new WebApi(options);
            }
        };
    }
    if(typeof window === 'undefined') {module.exports = init;}
	if(typeof WEBSPELLCHECKER !== 'undefined') {init(WEBSPELLCHECKER);}
})();