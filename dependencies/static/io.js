
// io.js
/**
 * @fileoverview Static Module. ImputOutput Manager of WEBSPELLCHECKER
 */
(function() {
	function init( Namespace ) {
		var Utils = Namespace.Utils,
			logger = Namespace.logger.console;

		/**
		 * Mocked request
		 * @static
		 * @privat
		 */
		var isMocked = false,

			/**
			 * Mocked params
			 * @static
			 * @privat
			 */
			mockParams = [];

		/**
		 * @exports SCAYT.prototype.IO
		 */
		var IO = {

			/**
			 * Link to XMLHttpRequest constructor
			 *
			 * @alias SCAYT.prototype.IO
			 */
			XMLHttpRequest: (typeof XMLHttpRequest !== 'undefined') ? XMLHttpRequest : null,
			/**
			 * Link to XDomainRequest constructor
			 *
			 * @alias SCAYT.prototype.IO
			 */
			XDomainRequest: (typeof XDomainRequest !== 'undefined') ? XDomainRequest : null,
			/**
			 * Make url
			 * @param {Object} params Define params that we need
			 * @constructor
			 */
			URL: function( params ) {
				params = params || {};

				var _url = '',
					_protocol = this.protocol = params.protocol || 'http',
					_host = this.host = params.host || 'localhost',
					_port = this.port = params.port || '80',
					_path = this.path = params.path || '',
					request_params = {};

				this.addParameter = function( name, value ) {

					if ( name && value ) {
						request_params[name] = value;
					}

					return this;
				};

				this.addParameters = function(parameters) {
					for(var param in parameters) {
						this.addParameter(param, parameters[param]);
					}

					return this;
				};

				this.getParameter = function( name ) {
					return request_params[name];
				};

				this.joinUrl = function() {
					var urlString = '';

					urlString += _protocol + '://';
					urlString += _host;
					urlString += _port == '80' ? '/' : ':' +_port + '/';
					urlString += _path.replace(/^\/*/, '');

					return urlString;
				};

				this.joinRequestParams = function() {
					var result = '';
					if ( Object.keys(request_params).length ) {
						for( var k in request_params) {
							result += k + '=' + encodeURIComponent(request_params[k]) + '&';
						}

						return result.slice(0, -1);
					}

					return '';
				};

				this.build = function() {
					var joinedParams = this.joinRequestParams();

					_url += this.joinUrl();
					_url += joinedParams ? '?' : '';
					_url += joinedParams;

					return _url;
				};
			},
			/**
			 * Make reqest using AJAX way
			 * @param {Object} params Define params that we need
			 * @param {Object} params.url URL object for this request
			 * @param {String} params.onSuccess Handler successful response from the server
			 * @param {String} params.onError Handler unsuccessful response from the server
			 * @return {Object} AJAX request custom object
			 */
			AJAX: function(params) {
				var ajax = {},
					parse = JSON.parse || function() { return arguments };

				if( isMocked ) {

					for ( var i = 0; i < mockParams.length; i++ ) {

						if( mockParams[i].success ) {
							params.onSuccess( mockParams[i].success );
						}

						if( mockParams[i].error ) {
							params.onError( mockParams[i].error );
						}
					}

					// TODO: create Object for GET method and refactor current method
					return {finished : true};
				}

				ajax.params = {
					url: params.url.joinUrl(),
					data: params.url.joinRequestParams(),
					onSuccess: params.onSuccess,
					onError: params.onError
				};

				ajax.request = new IO.XMLHttpRequest();

				if (IO.XDomainRequest !== null) {
					// for IE's versions 8, 9
					ajax.request = new IO.XDomainRequest();
				} else if ('withCredentials' in ajax.request) {
					// Set the value to 'true' if you'd like to pass cookies to the server.
					ajax.request.withCredentials = false;
				} else {
					logger.warn('Cors is not supported by this browser!');
				}

				ajax.request.onload = function() {
					var responseData = ajax.request.responseText;
					ajax.success = true;

					try {
						responseData = parse(responseData);
					} catch (error) {
						logger.warn("CORS response parsing error: " + error);
					}

					if(responseData && responseData.error) {
						responseData.message && logger.warn(responseData.message);
						ajax.params.onError && ajax.params.onError(responseData);
					} else {
						ajax.params.onSuccess && ajax.params.onSuccess(responseData);
					}
				};

				ajax.request.onerror = function() {
					ajax.error = true;
					ajax.params.onError && ajax.params.onError({});
				};

				ajax.request.onabort = function() {
					ajax.error = true;
					ajax.params.onError && ajax.params.onError({});
				};

				ajax.request.open('POST', ajax.params.url, true);
				// Fixed IE9 bug with ajax requests.
				if (Utils.Browser.ie && Utils.Browser.version === 9) {
					setTimeout(function() {
						ajax.request.send(ajax.params.data);
					}, 500);
				} else {
					ajax.request.send(ajax.params.data);
				}

				return ajax;
			},
			/**
			 * Make reqest using JSONP way
			 * @param {Object} params Define params that we need
			 * @param {Object} params.url URL object for this request
			 * @param {String} params.onSuccess Handler successful response from the server
			 * @param {String} params.onError Handler unsuccessful response from the server
			 * @return {Object} Script Model
			 */
			JSONP: function(params) {
				var callbackName = ( "callback" + Math.random().toString(20).substr(2,9) ),
					callbackFunctionPath = "SCAYT.prototype.IO.";

				if( isMocked ) {

					for ( var i = 0; i < mockParams.length; i++ ) {

						if( mockParams[i].success ) {
							params.onSuccess( mockParams[i].success );
						}

						if( mockParams[i].error ) {
							params.onError( mockParams[i].error );
						}
					}

					// TODO: create Object for GET method and refactor current method
					return callbackName;
				}

				params.url.addParameter("callback", callbackFunctionPath + callbackName);

				return new IO.Script({
					url: params.url.build(),
					id: callbackName,
					callbackName: callbackName,
					onSuccess: params.onSuccess,
					onError: params.onError
				});
			},
			/**
			 * Make reqest using Node.js Http server.
			 * @param {Object} params Define params that we need
			 * @param {Object} params.url URL object for this request
			 * @param {String} params.onSuccess Handler successful response from the server
			 * @param {String} params.onError Handler unsuccessful response from the server
			 * @return {Object} Script Model
			 */
			NODE: function(params) {
				var url = params.url,
					client = ( url.protocol === 'http' ) ? require('http') : require('https'),
					requestOptions = {
						protocol: url.protocol + ':',
						port: url.port,
						hostname: url.host,
						path: '/' + url.path,
						method: 'POST',
						headers: {
							'Content-Type': 'text/javascript; charset=UTF-8',
						}
					},
					request;

				request = client.request(requestOptions, function(response) {
					if (response.statusCode < 200 || response.statusCode > 299) {
						params.onError && params.onError('Failed to load page, status code: ' + response.statusCode);
					}
					// temporary data holder
					var body = [];
					// on every content chunk, push it to the data array
					response.on('data', function(chunk) {
						body.push(chunk);
					});
					// we are done, resolve promise with those joined chunks
					response.on('end', function(){
						var responseData = body.join('');

						try {
							responseData = JSON.parse(responseData);
						} catch (error) {
							logger.warn("CORS response parsing error: " + error);
						}
						if(responseData && responseData.error) {
							responseData.message && logger.warn(responseData.message);
							params.onError && params.onError(responseData);
						} else {
							params.onSuccess && params.onSuccess(responseData);
						}
					});
				});
				request.on('error', function(error) {
					params.onError && params.onError({});
				});
				request.write( params.url.joinRequestParams() );
				request.end();

				return request;
			},
			/**
			 * Create script tag
			 * @param {Object} params Define params that we need
			 * @param {String} [params.url=''] URL for script src attribute
			 * @param {String} [params.id=''] ID for script id attribute
			* @param {String} params.callbackName Callback name for JSONP request
			* @param {String} params.onSuccess Handler successful response from the server
			* @param {String} params.onError Handler unsuccessful response from the server
			* @return {HTMLScriptElement} HTML Script Element
			* @constructor
			*/
			Script: function( params ) {
				params = params || {};
				var self = this,
					responseData; // Variable for JSONP response data

				var registerCallback = function() {
					SCAYT.prototype.IO[params.callbackName] = function(data) {
						responseData = data;
					};
				};

				var removeCallback = function() {
					delete SCAYT.prototype.IO[params.callbackName];
				};

				var removeAll = function() {
					removeCallback();
					self.removeScript();
				};

				params.callbackName && registerCallback();

				var script = document.createElement('script');

				script['type'] = 'text/javascript';
				script['id'] = params.id ? params.id : '';
				script['src'] = params.url ? params.url : '';

				script.onload = function() {
					if (this.success) return; // for tests and for single call in IE8

					this.success = true;

					if (params.callbackName) {
						if (responseData && responseData.error) {
							responseData.message && logger.warn(responseData.message);
							params.onError && params.onError(responseData);
						} else {
							params.onSuccess && params.onSuccess(responseData);
						}

						removeAll();
					} else {
						params.onSuccess && params.onSuccess();
					}
				};

				script.onerror = function() {
					this.error = true; // for tests

					params.onError && params.onError({});

					if (params.callbackName) {
						removeAll();
					}
				};

				script.onreadystatechange = function() {
					var self = this;

					if (this.readyState === 'complete' || this.readyState === 'loaded') {
						setTimeout(function() {
							self.onload();
						}, 0);
					}
				};

				UILib.appendTo(script, 'head');

				this.getScript = function() {
					return script;
				};

				this.removeScript = function() {
					UILib.remove(script);
					script = null;
				};
			},

			/**
			 * Create request on server
			 * @param  {Object} url         Object created with params
			 * @param  {Function} onSuccess Handler successful response from the server
			 * @param  {Function} onError   Handler unsuccessful response from the server
			 * @return {String}             Callback function name
			 */
			get: function( url , onSuccess, onError ) {
				// Make Request using defined request types
				return IO.request({
					url: url,
					onSuccess: onSuccess,
					onError: onError
				});
			},

			/**
			 * Load script from the server
			 * @param  {Object} url         Object created with params
			 * @param  {Function} onSuccess Handler successful response from the server
			 * @param  {Function} onError   Handler unsuccessful response from the server
			 */
			loadScript: function( url , onSuccess, onError ) {
				var cache = IO.loadScript.cache ? IO.loadScript.cache : IO.loadScript.cache = {};

				url = url.build();

				if (cache.hasOwnProperty(url)) return;

				cache[url] = true;

				// Create new script element
				var script = new IO.Script({
					url: url,
					onSuccess: onSuccess,
					onError: onError
				});

				return script;
			},

			/**
			 * @TODO ioMockStart description
			 * @param  {Array} params [description]
			 * @function
			 */
			ioMockStart: function( params ) {
				isMocked = true;
				mockParams = params ? params : mockParams;
			},

			/**
			 * ioMockEnd description
			 * @function
			 */
			ioMockEnd: function() {
				isMocked = false;
			}
		};
		/**
		 * Define list of request types
		 *
		 * @alias SCAYT.prototype.IO
		 */
		IO.requestTypes = {
			AJAX: IO.AJAX,
			JSONP: IO.JSONP,
			NODE: IO.NODE
		};

		IO.setRequestType = function(type) {
			var requestType = IO.requestTypes[type];
			if(requestType) {
				IO.request = requestType;
			}
		};
		/**
		 * Define request type for IO Manager
		 *
		 * @alias SCAYT.prototype.IO
		 */
		IO.request = (Namespace.env === Namespace.envTypes.node) ?
			IO.requestTypes.NODE :
			IO.requestTypes.AJAX ;


		/**
		 * Static Module. Imput&Output (IO) Manager of SCAYT
		 *
		 * @alias SCAYT.prototype.IO
		 */
		Namespace.IO = IO;
	}

    if(typeof window === 'undefined') {module.exports = init;}
	if(typeof WEBSPELLCHECKER !== 'undefined') {init(WEBSPELLCHECKER);}
})();