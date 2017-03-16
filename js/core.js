/**
 * Copyright MAGNETIC IP, OU.
 * @author github.com/tiamo (TeslaAmazing team)
 * @since 2015
 */

TA = {};
(function($, undefined) {

	if (!$) {
		throw 'jQuery required.';
	}

	TA.utils = {
		randomInt: function(min, max) {
			if (max==0) return min;
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},
		randomFloat: function(min, max) {
			if (max==0) return min;
			return min + Math.random() * (max - min);
		},
		/**
		 * Function used to determine the RGB colour value that was passed as HEX
		 * @return [array]
		 */
		getRGB: function(color) {
			var result;
			// Look for rgb(num,num,num)
			if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color)) return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];
			// Look for rgb(num%,num%,num%)
			if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color)) return [parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55];
			// Look for #a0b1c2
			if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color)) return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
			// Look for #fff
			if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color)) return [parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16)];
		}
	}

})(jQuery);
