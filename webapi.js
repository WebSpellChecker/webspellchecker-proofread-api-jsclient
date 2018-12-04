// webapi.js
/**
 * @namespace WEBSPELLCHECKER
 */
(function() {
    function init(Namespace) {
        // Private
        var OptionsManager = Namespace.OptionsManager,
            logger = Namespace.logger,
            optionTypes = OptionsManager.optionTypes,
            optionsTemplate;

        logger.isON(true);

        optionsTemplate = {
            lang: {
                type: optionTypes.string,
                defaultValue: 'en_US'
            },
            serviceProtocol: {
                type: optionTypes.urlProtocol,
                defaultValue: 'http'
            },
            serviceHost: {
                type: optionTypes.urlHost,
                defaultValue: 'svc.webspellchecker.net'
            },
            servicePort: {
                type: optionTypes.urlPort,
                defaultValue: 80
            },
            servicePath: {
                type: optionTypes.urlPath,
                defaultValue: 'spellcheck31/script/ssrv.cgi'
            },
            serviceId: {
                type: optionTypes.string,
                defaultValue: '1:KpkvQ2-6KNUj-L1W3u2-C9j0K1-Zv2tY1-CfDOx-WfGRg2-qXtci-YyyE34-j09H42-b0aCt3-d9a'
            },
            userDictionaryName: {
                type: optionTypes.string,
                defaultValue: ''
            },
            customDictionaryIds: {
                type: optionTypes.string,
                defaultValue: ''
            },
            minWordLength: {
                type: optionTypes.number,
                defaultValue: 3
            },
            communicationFormat: {
                type: optionTypes.string,
                defaultValue: 'json'
            },
            customPunctuation: {
                type: optionTypes.string,
                defaultValue: ''
            },
            appType: {
                type: optionTypes.string,
                defaultValue: 'web_api'
            }
        };

        OptionsManager.exportOptionsTemplate('WebApiTemplate', optionsTemplate);

        /**
         * @constructor
         * @param {Object} clientOptions
         * @private
         */
        function WebApi(clientOptions) {
            var self = this,
                isErrorsCritical,
                connection;

            this._services = {};

            // Create options based on clientOptions from user and with WebApiTemplate template.
            this._options = OptionsManager.createOptions(clientOptions, 'WebApiTemplate', function errorHandler(errors) {
                isErrorsCritical = errors.critical;

                errors.reports.forEach(function(report) {
                    logger.log(report.message);
                }, this);
            });

            // Instance based dependencies
            this._dependencies = {
                'TextProcessor': Namespace.TextProcessor,
                'Connection': Namespace.Connection
            };

            for (var k in this._dependencies) {
                this._services[k] = new this._dependencies[k](k, this);
            }

            connection = this._services['Connection'];
            this._commands = connection.getCommands();
            this._udActions = connection.getUdActions();
        }

        /**
         * @namespace WebApiInstance
         */
        WebApi.prototype = {
            constructor: WebApi,
            /**
             * Return instance of dependencie.
             * @private
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
            _request: function(data, parameters) {
                return this._getService('Connection').request(
                    data,
                    parameters.success || function() {},
                    parameters.error || function() {}
                );
            },
            _makeUdAction: function(actionName, parameters) {
                if (typeof parameters.name === 'undefined') {
                    parameters.name = this.getOption('userDictionaryName');
                }
                var requestparameters = {
                        command: this._commands.userDictionary,
                        UDAction: this._udActions[actionName],
                        UDName: parameters.name,
                        newUDName: parameters.newName,
                        wordList: parameters.wordList,
                        UDWord: parameters.word
                    };

                return this._request(requestparameters, parameters);
            },
            _udMethodWrapper: function(actionName, parameters) {
                var self = this,
                    success = parameters.success || function(){};

                parameters.success = function(responseInfo) {
                    var ud = new UserDictionary({
                            wordlist: responseInfo.wordlist,
                            name: responseInfo.name,
                            modificationTime: responseInfo.modificationTime,
                            makeUdAction: self._makeUdAction.bind(self)
                        });

                    success(ud);
                };

                return this._makeUdAction(actionName, parameters);
            },
            getOption: function(name) {
                return this._options[name];
            },
            setOption: function(name, value) {
                var result = false,
                    template = {},
                    option = {};

                if (optionsTemplate[name]) {
                    result = true;
                    template[name] = optionsTemplate[name];
                    option[name] = value;
                    this._options[name] = OptionsManager.createOptions(option, template)[name];
                }

                return result;
            },
            /**
             * getInfo success Callback.
             *
             * @callback getInfoCallback
             * @param {Object} data
             * @param {Object} [data.langList={"ltr":{"en_US" : "American English","en_GB" : "British English","fr_FR" : "French","de_DE" : "German","it_IT" : "Italian","es_ES" : "Spanish"},"rtl":{}}]
             *      Object with list of available languages. Separeted on ltr(left-to-right) and rtl(right-to-left) directions.
             * @param {Number} [data.verLang=9] Number of available languages.
             * @param {Boolean} [data.banner=false] Banner parameter for integrations.
             */

            /**
             * getInfo API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parameters
             * @param {getInfoCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
             * @returns {Object} - Transport object.
             * @example
             * wscWebApiInstance.getInfo({
             *      success: function(data) {
             *          console.log(data); // {"langList":{"ltr":{"en_US" : "American English","en_GB" : "British English","fr_FR" : "French","de_DE" : "German","it_IT" : "Italian","es_ES" : "Spanish"},"rtl":{}},"verLang":9}
             *      },
             *      error: function(error) {
             *          console.log(error);
             *      }
             * })
             */
            getInfo: function(parameters) {
                return this._request({
                        command: this._commands.getInfo
                    },
                    parameters
                );
            },
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
             * @param {Object} parameters
             * @param {GetLangListCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
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
            getLangList: function(parameters) {
                return this._request({
                        command: this._commands.getLangList
                    },
                    parameters
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
             * @param {Object} parameters
             * @param {String} parameters.text - Text to check spelling.
             * @param {String} parameters.lang - Spellcheck language. If not provided then take from constructor.
             * @param {SpellCheckCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
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
            spellCheck: function(parameters) {
                var _parameters = Object.assign({}, parameters),
                    words = this._getService('TextProcessor').getWordsFromString( _parameters.text ),
                    text = words.wordsCollection.join(',');

                function addOffsetsToMisspelled(data, offsets) {
                    var misspelled;

                    return offsets.reduce(function(prev, offsetsObj) {
                        for (var i = 0; i < data.length; i += 1) {
                            misspelled = data[i];

                            if (misspelled.word === offsetsObj.word) {
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

                _parameters.success = function(data) {
                    var misspelledsWithOffsets = addOffsetsToMisspelled(data, words.wordsOffsets);

                    parameters.success(misspelledsWithOffsets);
                };

                return this._request({
                        command: this._commands.spellCheck,
                        language:  _parameters.lang || this.getOption('lang'),
                        userWordlist: parameters.userWordlist,
                        customDictionary: this.getOption('customDictionaryIds'),
                        userDictionary: this.getOption('userDictionaryName'),
                        text: text
                    },
                    {
                        success: _parameters.success,
                        error: _parameters.error
                    }
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
             * @param {Object} parameters
             * @param {String} parameters.text - Text to grammar checking.
             * @param {String} parameters.lang - Grammarcheck language. If not provided then take from constructor.
             * @param {GrammarCheckCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
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
            grammarCheck: function(parameters) {
                return this._request({
                        command: this._commands.grammarCheck,
                        language: parameters.lang || this.getOption('lang'),
                        sentences: parameters.sentences,
                        text: parameters.text
                    },
                    parameters
                );
            },
            /**
             * userDictionary success Callback.
             *
             * @callback UserDictionaryCallback
             * @param {UserDictionary} UDObject
             */

            /**
             * getUserDictionary API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parameters
             * @param {String} parameters.name - User dictionary name.
             * @param {UserDictionaryCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
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
            getUserDictionary: function(parameters) {
                return this._udMethodWrapper('getDict', parameters);
            },
            /**
             * createUserDictionary API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parameters
             * @param {String} parameters.name - User dictionary name.
             * @param {String} parameters.wordList - Word list.
             *
             * @param {UserDictionaryCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
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
            createUserDictionary: function(parameters) {
                return this._udMethodWrapper('create', parameters);
            },
            /**
             * deleteUserDictionary API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parameters
             * @param {String} parameters.name - User dictionary name.
             * @param {UserDictionaryCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
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
            deleteUserDictionary: function(parameters) {
                return this._udMethodWrapper('delete', parameters);
            },
            /**
             * renameUserDictionary API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parameters
             * @param {String} parameters.name - User dictionary name.
             * @param {String} parameters.newName - New user dictionary name.
             * @param {UserDictionaryCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
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
            renameUserDictionary: function(parameters) {
                return this._udMethodWrapper('rename' , parameters);
            },
            /**
             * addWordToUserDictionary API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parameters
             * @param {String} parameters.name - User dictionary name.
             * @param {String} parameters.word - Word what will be added to UD.
             * @param {UserDictionaryCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
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
            addWordToUserDictionary: function(parameters) {
                return this._udMethodWrapper('addWord', parameters);
            },
            /**
             * deleteWordFromUserDictionary API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parameters
             * @param {String} parameters.name - User dictionary name.
             * @param {String} parameters.word - Word what will be deleted from UD.
             * @param {UserDictionaryCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
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
            deleteWordFromUserDictionary: function(parameters) {
                return this._udMethodWrapper('deleteWord', parameters);
            },
            /**
             * getDictionariesModifyTime API method.
             * @public
             * @memberof WebApiInstance#
             *
             * @param {Object} parameters
             * @param {String} parameters.userDictionary - User dictionary name.
             * @param {String} parameters.customDictionary - Custom dictionary name.
             * @param {GetDictionariesModifyTime} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
             * @returns {Object} - Transport object.
             * @example
             * wscWebApiInstance.getDictionariesModifyTime({
             *      userDictionary: 'udName',
             *      customDictionary: '1',
             *      success: function(data) {
             *          console.log(data); // {"customDicts":{},"userDicts":{"udName": 1513613189}}
             *      },
             *      error: function(error) {
             *          console.log(error);
             *      }
             * })
             */
            getDictionariesModifyTime: function(parameters) {
                return this._request({
                        command: this._commands.getDictionariesModifyTime,
                        UDName: parameters.userDictionary,
                        customDictionary: parameters.customDictionary
                    },
                    parameters
                );
            },
        };

        /**
         * UserDictionary constructor.
         * Encapsulates the construction of a query for UD request.
         *
         * @typedef {(Object)} UserDictionary
         * @namespace UserDictionary
         * @property {String} parameters.name - List of available UD actions.
         * @property {function} parameters.wordlist - List of words in current dictionary.
         * @property {function} parameters.makeUdAction - Request-maker function.
         */
        function UserDictionary(parameters) {
            this.name = parameters.name;
            this.wordlist = parameters.wordlist;
            this.modificationTime = parameters.modificationTime;
            this.makeUdAction = parameters.makeUdAction;
        }

        UserDictionary.prototype = {
            constructor: UserDictionary,
            _action: function(actionName, parameters) {
                this.makeUdAction(actionName, Object.assign({
                    name: this.name
                }, parameters) );
            },
            /**
             *  Add word to current user dictionary.
             *
             * @property {Object} parameters
             * @memberof UserDictionary
             *
             * @property {String} parameters.word - Word what will be added to UD.
             * @property {UserDictionaryCallback} parameters.success - Handler successful response from the server.
             * @property {RequestCallback} parameters.error - Handler unsuccessful response from the server.
             */
            addWord: function(parameters) {
                var success = parameters.success,
                    self = this;

                parameters.success = function(responseInfo) {
                    self.wordlist.push(parameters.word);
                    success(self);
                };
                this._action('addWord', parameters);
            },
            /**
             *  Delete word to current user dictionary.
             *
             * @memberof UserDictionary
             * @param {Object} parameters
             *
             * @param {String} parameters.word - Word what will be deleted from UD.
             * @param {UserDictionaryCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
             */
            deleteWord: function(parameters) {
                var success = parameters.success,
                    word = parameters.word,
                    self = this;

                parameters.success = function(responseInfo) {
                    var wordlist = [];

                    for (var i = 0; i < self.wordlist.length; i += 1) {
                        if (self.wordlist[i] !== word) {
                            wordlist.push(wordlist[i]);
                        }
                    }

                    self.wordlist = wordlist;
                    success(self);
                };
                this._action('deleteWord', parameters);
            },
            /**
             *  Delete current user dictionary.
             *
             * @memberof UserDictionary
             * @param {Object} parameters
             *
             * @param {UserDictionaryCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
             */
            'delete': function(parameters) {
                var success = parameters.success,
                    self = this;

                parameters.success = function(responseInfo) {
                    this.name = undefined;
                    this.wordlist = undefined;
                    success(self);
                };
                this._action('delete', parameters);
            },
            /**
             *  Rename current user dictionary.
             *
             * @memberof UserDictionary
             * @param {Object} parameters
             *
             * @param {String} parameters.newName - New Ud name.
             * @param {UserDictionaryCallback} parameters.success - Handler successful response from the server.
             * @param {RequestCallback} parameters.error - Handler unsuccessful response from the server.
             */
            rename: function(parameters) {
                var success = parameters.success,
                    self = this;

                parameters.success = function(responseInfo) {
                    self.name = parameters.newName;
                    success(self);
                };
                this._action('rename', parameters);
            },
            /**
             *  Return UD Word list.
             * @memberof UserDictionary
             *
             * @returns {Array} UD word list.
             */
            getWordList: function() {
                return this.wordlist.slice();
            }
        };

        /**
         * Method check client options and return WebApi instance.
         * @memberof WEBSPELLCHECKER
         * @method WEBSPELLCHECKER.initWebApi
         * @param {Object} options
         * <start options doc>
         * @property {string} [options.lang='en_US'] - The parameter sets the default spell checking language for WEBSPELLCHECKER. Possible values are:
         * 'en_US', 'en_GB', 'pt_BR', 'da_DK',
         * 'nl_NL', 'en_CA', 'fi_FI', 'fr_FR',
         * 'fr_CA', 'de_DE', 'el_GR', 'it_IT',
         * 'nb_NO', 'pt_PT', 'es_ES', 'sv_SE'.
         *
         * @property {string} [options.serviceProtocol='http'] - The parameter allows specifying a protocol for the WSC service (the entry point is ssrv.cgi) full path.
         *
         * @property {string} [options.serviceHost='svc.webspellchecker.net'] - The parameter allows specifying a host for the WSC service (the entry point is ssrv.cgi) full path.
         *
         * @property {number} [options.servicePort='80'] - The parameter allows specifying a default port for the WSC service (the entry point is ssrv.cgi) full path.
         *
         * @property {string} [options.servicePath='spellcheck31/script/ssrv.cgi'] - The parameter is used to specify a path to the WSC service (the entry point is ssrv.cgi) full path.
         *
         * @property {number} [options.minWordLength=3] - The parameter defines minimum length of the letters that will be collected from container's text for spell checking.
         * Possible value is any positive number.
         *
         * @property {string} [options.customDictionaryIds=''] - The parameter links WEBSPELLCHECKER to custom dictionaries. Here is a string containing dictionary IDs separated by commas (',').
         * Further details can be found at [link](@@BRANDING_CUSTOM_DICT_MANUAL_URL).
         *
         * @property {string} [options.userDictionaryName=''] - The parameter activates a User Dictionary in WEBSPELLCHECKER.
         *
         * @property {string} [options.serviceId=''] - The parameter sets the service ID for WEBSPELLCHECKER. It used for a migration from free,
         * ad-supported version to paid, ad-free version.
         *
         * @property {String} [options.customPunctuation=''] - The parameter that receives a string with characters that will considered as separators.
         *
         * <end options doc>
         * @returns {WebApiInstance} - WebApi Instance.
         */
        Namespace.initWebApi = function(options) {
            return new WebApi(options);
        };
    }

    if (typeof window === 'undefined') {
        module.exports = init;
    }

	if (typeof WEBSPELLCHECKER !== 'undefined' && !('initWebApi' in WEBSPELLCHECKER)) {
        init(WEBSPELLCHECKER);
    }
})();