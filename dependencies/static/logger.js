// logger.js
/**
 * @fileoverview Static Module. Logger manager for WEBSPELLCHECKER
 */
(function() {
	function init( Namespace ) {
		'use strict';

		var methods = ['log', 'warn', 'info', 'debug'],
			browser = Namespace.Utils.browser;

		JSON.stringify = JSON.stringify || function() { return arguments };

		// rewrite the property, if the property is not supported, applied empty function
		for (var i = 0; i < methods.length; i++) {
			console[methods[i]] = console[methods[i]] || function() {};
		};

		var trigger = false;

		/**
		 * @exports WEBSPELLCHECKER.logger
		 */
		var logger = {
			/**
			 * Enable/disable logging in SCAYT
			 * @memberof SCAYT.prototype#
			 * @param {boolean} state - State
			 * @returns {boolean} - Variable
			 */
			isON: function(state) {
				state = state || false;
				trigger = ( !!state ? true : (/scaytDebug\b/.test(location.hash)) );
			},

			/**
			 * Check browser
			 * @memberof SCAYT.prototype#
			 * @type {boolean}
			 * @returns {boolean} - true/false
			 */
			isIE: (browser) ? browser.ie : false,

			/**
			 * function for logging
			 * @memberof SCAYT.prototype#
			 * @param {object} data - incoming messages
			 * @returns {string} - output message
			 */
			log: function(data) {
				var options = data || {},
					message = undefined;

				if (!trigger) {
					return;
				}

				if (typeof options === 'object') {
					message = [options.name, ':: ' + options.msg, options.data];
				} else {
					message = [options];
				}
				if (this.isIE) {
					message = [options.name, ':: ' + options.msg, JSON.stringify(options.data, null, "")];
					message = message.join(' ');
					console.log(message);
				} else {
					console.log.apply(console, message);
				}
			},

			/**
			 * Avoid 'console' errors in browsers that lack a console.
			 * @memberof SCAYT.prototype#
			 * @type {object}
			 * @returns {object} - real browser console or object with empty function to avoid 'console' errors
			 */
			console: console
		};

		/**
		 * Static Module. logger manager for SCAYT
		 *
		 * @alias SCAYT.prototype.logger
		 */
		Namespace.logger = logger;
	}

	if (typeof window === 'undefined') {
		module.exports = init;
	}

	if (typeof WEBSPELLCHECKER !== 'undefined' && !('logger' in WEBSPELLCHECKER)) {
		init(WEBSPELLCHECKER);
	}
})();