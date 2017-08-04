# WebSpellChecker JavaScript Api

Browser and Node Javascript API which provide methods for spell and grammar check and methods for managing user dictionary. Full list of parameters and methods you can find by following [this link](https://www.webspellchecker.net/jswebapi/documentation/WEBSPELLCHECKER.html)

## Getting Started

To start working with WebSpellChecker API use the following instructions:

### Installing

```
npm install webspellchecker-api --save
```

```javascript
var WEBSPELLCHECKER = reqire('webspellchecker-api');
```
or for browsers
```html
<script type="text/javascript" src="//www.webspellchecker.net/jswebapi/webspellchecker-api.js"></script>
```

### Simple example
```javascript
var proofreadApi = new WEBSPELLCHECKER({
    lang: 'en_US',
    customerId: '<your customer id>',
});
proofreadApi.spellCheck({
    text: 'mispeled text',
    success: function(data) {
        console.log(data); //[{"word":"mispeled","ud":"false","suggestions":["misspelled","dispelled","morseled","misdeed","impelled","misapplied","misdeeds","misfiled","misspelt","airspeed","chiseled","misruled","misspell","misspend","tinseled"]}]
    },
    error: funcion() {}
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
