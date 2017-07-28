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
        /**
         * Static
         */
        var OptionsProcessor =  WEBSPELLCHECKER.OptionsProcessor,
            logger = WEBSPELLCHECKER.logger;
        /**
         * Variables
         */ 
        var  _options, _optionTypes, _optionsTemplates,
            _dependencies, _services = {},
            connection, textProcessor,
            commands,
            userDictionaryManager;

        /**
         * options
         */
        _optionTypes = OptionsProcessor.optionTypes;
        _optionsTemplates = {
            lang: {
                type: _optionTypes.string,
                defaultValue: 'en_US'
            },
            service_protocol: {
                type: _optionTypes.url_protocol,
                defaultValue: 'http'
            },
            service_host: {
                type: _optionTypes.url_host,
                defaultValue: 'svc.webspellchecker.net'
            },
            service_port: {
                type: _optionTypes.url_port,
                defaultValue: 80
            },
            service_path: {
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
            }
        };
        _options = OptionsProcessor.createOptions(clientOptions, _optionsTemplates);
        /**
         * Private
         */
        this._getService = function(name) {
            return _services[name] || null;
        };

        this._request = function(data, success, error) {
            return connection.request(
                data,
                success,
                error
            );
        };
        /**
         * Accessors
         */
        this.getOption = function(name) {
            return _options[name];
        };
        this.setOption = function(name, value) {
            var result = false,
                template = _optionsTemplates[name];
            if(template) {
                result = true;
                _options[name] = OptionsProcessor.createOption({
                    name: name,
                    value: value,
                    template: template,
                    errorHandler: function(error) {
                        logger.log(error.message);
                        result = false;
                    }
                });
            }
            return result;
        };
        /**
         * instancebased dependencies
         */
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
         * UserDictionary Manager
         */
        function UserDictionaryManager(parametrs) {
            this.actions = parametrs.actions;
            this._request = parametrs._request;
            this.defaultParametrs = {
                command: parametrs.command
            };
        }

        UserDictionaryManager.prototype = {
            constructor: UserDictionaryManager,
            action: function(actionName, parametrs) {
                var actionMethod = this[actionName],
                    requestParametrs = Object.assign(
                        {},
                        this.defaultParametrs,
                        actionMethod.call(this, parametrs)
                    );

                requestParametrs.UDName = parametrs.name;

                return this._request(
                    requestParametrs,
                    parametrs.success,
                    parametrs.error
                );
            },
            get: function(parametrs) {
                return {
                    UDAction: this.actions.getDict
                };
            },
            create: function(parametrs) {
                return {
                    UDAction: this.actions.create,
                    wordList: parametrs.wordList || ''
                };
            },
            delete: function(parametrs) {
                return {
                    UDAction: this.actions.delete
                };
            },
            rename: function(parametrs) {
                return {
                    UDAction: this.actions.rename,
                    newUDName: parametrs.newName
                };
            },
            addWord: function(parametrs) {
                return {
                    UDAction: this.actions.addWord,
                    UDWord: parametrs.word
                };
            },
            deleteWord: function(parametrs) {
                return {
                    UDAction: this.actions.deleteWord,
                    UDWord: parametrs.word
                };
            }
        };

        userDictionaryManager = new UserDictionaryManager({
            actions: connection.getUDActions(),
            command: commands.userDictionary,
            _request: this._request
        });
        /**
         * API
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

        this.getUserDictionary = function(parametrs) {
            return userDictionaryManager.action('get', parametrs);
        };

        this.createUserDictionary = function(parametrs) {
            return userDictionaryManager.action('create', parametrs);
        };

        this.deleteUserDictionary = function(parametrs) {
            return userDictionaryManager.action('delete', parametrs);
        };

        this.renameUserDictionary = function(parametrs) {
            return userDictionaryManager.action('rename' , parametrs);
        };

        this.addWordToUserDictionary = function(parametrs) {
            return userDictionaryManager.action('addWord', parametrs);
        };
        
        this.deleteWordFromUserDictionary = function(parametrs) {
            return userDictionaryManager.action('deleteWord', parametrs);
        };

        this.getBanner = function(parametrs) {
          //  setTimeout(()=>{ parametrs.success();}, 100);
        };
    };

    WEBSPELLCHECKER.env = env;
    WEBSPELLCHECKER.envTypes = envTypes;
    WEBSPELLCHECKER.isNamespace = true;
    
    if(env === envTypes.node) {
        module.exports = WEBSPELLCHECKER;
    }
})();