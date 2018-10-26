# WebSpellChecker API

WebSpellChecker API is a browser, Node.js client that introduces more convenient way to work with WebSpellChecker Service. It provides methods for spell- and grammar checking on multiple languages, and various methods to work with personal user dictionaries.


To explore the  full list of parameters and methods available, please visit this [page](http://dev.webspellchecker.net/api/webapi/WEBSPELLCHECKER.html#.initWebApi).

# Supported Languages
WebSpellChecker API provides multi-language support.
The next languages are supported by default: American English, Canadian English, British English, Danish, Dutch, Canadian French, Finnish, French, German, Greek, Italian, Portuguese, Brazilian Portuguese, Norwegian Bokmal, Spanish, Swedish.

There are also additional languages and specialized dictionaries available, you can check the full list [here](https://docs.webspellchecker.net/display/KnowledgeBase/Languages+and+Specialized+Dictionaries+Support).

# Installation

```
npm install webspellchecker-api --save
```

```javascript
var WEBSPELLCHECKER = require('webspellchecker-api');
```

# Obtain Service ID

In order to start using WebSpellChecker API, you have to obtain a service key. You can do it here by subscribing to [Cloud Web API](https://www.webspellchecker.net/signup/hosted-signup.html#wsc-trial).

# Usage

## Spellcheck API

```javascript
var proofreadApi = WEBSPELLCHECKER.initWebApi({
    lang: 'en_US', // You can get a list of supported languages with their shortcodes here: http://dev.webspellchecker.net/api/webapi/WEBSPELLCHECKER.html
    serviceId: '<your service id>' //The serviceId is a required parameter. In order to start using WebSpellChecker API, you have to obtain a service key.
});
proofreadApi.spellCheck({
    text: 'mispeled text',
    success: function(data) {
        console.log(data);
        //[ { word: 'mispeled',
        //    ud: false,
        //    suggestions:[
        //        'misspelled',
        //        'dispelled',
        //        'morseled',
        //        'misdeed',
        //        'HiSpeed',
        //        'impelled',
        //        'misapplied',
        //        'misdeeds'
        //    ],
        //    startOffset: 0,
        //    endOffset: 8
        //} ]
    },
    error: function() {}
});
```

## Grammarcheck API

```javascript
proofreadApi.grammarCheck({
    text: 'mispeled text',
    success: function(data) {
        console.log(data); //[ { sentence: 'mispeled text', matches: [ [Object] ] } ]
        console.log(data[0].matches);
        // [ { message: 'This sentence does not start with an uppercase letter',
        //     offset: 0,
        //     length: 8,
        //     rule: { id: 'UPPERCASE_SENTENCE_START' },
        //     suggestions: [ 'Mispeled' ] } ]
    },
    error: function() {}
});
```

## Add word to User Dictionary

```javascript
proofreadApi.addWordToUserDictionary({
     name: 'testDictionary',
     word: 'exaple',
     success: function(data) {
         console.log(data); // {"name":"testDictionary","action":"addWord","wordlist":['exaple']}
     },
     error: function(error) {
         console.log(error);
     }
});
```

## Running tests

Just run the next command:

```
npm test
```

## Building
To build and concatenate the minified version, please run the next command:

```
grunt
```
The built version  will be placed in the `dest` folder.

# License

This project is licensed under the MIT License.
