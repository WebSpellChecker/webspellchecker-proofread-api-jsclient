# Spellcheck | Grammarcheck JavaScript API

Browser and Node API which provide methods for spell and grammar check and methods for managing user dictionary. Full list of parameters and methods you can find by following
<a target="_blank" href="http://dev.webspellchecker.net/api/webapi/WEBSPELLCHECKER.html#.initWebApi">link</a>

## Getting Started

To start working with WebSpellChecker API use the following instructions:

### Installing

```
npm install webspellchecker-api --save
```

```javascript
var WEBSPELLCHECKER = require('webspellchecker-api');
```

### Simple example
```javascript
var proofreadApi = WEBSPELLCHECKER.initWebApi({
    lang: 'en_US',
    serviceId: '<your service id>' // https://webspellchecker.net/webspellchecker-hosted-services.html,
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

### Running tests

Just run command:
```
npm test
```

### Building
To build and concatenate minified version run command:

```
grunt
```
Result will be added to the `dest` folder.

## License

This project is licensed under the MIT License.
