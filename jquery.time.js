xx(function ($) {
    var base;
    $.time = function (el, options) {
        base = this;
        base.$el = $(el);
        base.el = el;
        base.$el.data("time", base);
        base.init = function (action) {
            base.options = $.extend({}, $.time.defaultOptions, options);
			var cn = action ? functions[action] : functions.init;
			//console.log(cn);
			if(!cn){
				throw new Error("Unknown function name '"+ action +"' for timeago");
			}
			cn.call(this, options);
		}
		base.timeago=function(timestamp) {
			if (timestamp instanceof Date) {
				return base.inWords(timestamp);
			} else if (typeof timestamp === "string") {
				return base.inWords(base.options.parse(timestamp));
			} else if (typeof timestamp === "number") {
				return base.inWords(new Date(timestamp));
			} else {
				return base.inWords(base.options.datetime(timestamp));
			}
		};
		base.inWords=function(date) {
			
		return base.options.inWords(base.distance(date));
		}
		
		base.distance=function(date) {
		return (new Date().getTime() - date.getTime());
		}
		var functions = {
		init: function(){
		var refresh_el = $.proxy(refresh, this);
		
		refresh_el();
		if (base.options.settings.refreshMillis > 0) {
		this._timeagoInterval = setInterval(refresh_el, base.options.settings.refreshMillis);
		}
		},
		update: function(time){
		
		var parsedTime = base.options.parse(time);
		$(this).data('timedata', { datetime: parsedTime });
		
		if(base.options.settings.localeTitle) $(this).attr("title", parsedTime.toLocaleString());
		refresh.apply(this);
		},
		updateFromDOM: function(){
		
		$(this).data('timedata', { datetime: base.options.parse( base.options.isTime(this) ? $(this).attr("datetime") : $(this).attr("data-date") ) });
		refresh.apply(this);
		},
		dispose: function () {
		
		if (this._timeagoInterval) {
		window.clearInterval(this._timeagoInterval);
		this._timeagoInterval = null;
		}
		}
		};
		function refresh() {
		$("span.posted-time").each(function(){
		var data = prepareData(this);
		
		if (!isNaN(data.datetime)) {
		if ( base.options.settings.cutoff == 0 || distance(data.datetime) < base.options.settings.cutoff) {
			
		$(this).text(base.inWords(data.datetime));
		}
		}
		})
		}
		
		function prepareData(element) {
		element = $(element);
		if (!element.data("timedate")) {
		element.data("timedate", { datetime: base.options.datetime(element) });
		var text = $.trim(element.text());
		if (base.options.settings.localeTitle) {
		element.attr("title", element.data('timedata').datetime.toLocaleString());
		} else if (text.length > 0 && !(base.options.isTime(element) && element.attr("data-date"))) {
		element.attr("title", text);
		}
		}
		return element.data("timedate");
		}
		
		
		base.init();
	}
	
	 $.time.defaultOptions = {
        
				settings: {
				refreshMillis: 10000,
				allowPast: true,
				allowFuture: false,
				localeTitle: false,
				cutoff: 0,
				strings: {
				prefixAgo: null,
				prefixFromNow: null,
				suffixAgo: "ago",
				suffixFromNow: "from now",
				inPast: 'any moment now',
				seconds: "less than a minute",
				minute: "about a minute",
				minutes: "%d minutes",
				hour: "about an hour",
				hours: "about %d hours",
				day: "a day",
				days: "%d days",
				month: "about a month",
				months: "%d months",
				year: "about a year",
				years: "%d years",
				wordSeparator: " ",
				numbers: []
				}
		},
		inWords: function(distanceMillis) {
		if(!this.settings.allowPast && ! this.settings.allowFuture) {
		throw 'timeago allowPast and allowFuture settings can not both be set to false.';
		}
		
		var prefix = base.options.settings.strings.prefixAgo;
		var suffix = base.options.settings.strings.suffixAgo;
		if (base.options.settings.allowFuture) {
		if (distanceMillis < 0) {
		prefix = base.options.settings.strings.prefixFromNow;
		suffix = base.options.settings.strings.suffixFromNow;
		}
		}
		
		if(!base.options.settings.allowPast && distanceMillis >= 0) {
		return base.options.settings.strings.inPast;
		}
		
		var seconds = Math.abs(distanceMillis) / 1000;
		var minutes = seconds / 60;
		var hours = minutes / 60;
		var days = hours / 24;
		var years = days / 365;
		
		function substitute(stringOrFunction, number) {
		var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
		var value = (base.options.settings.strings.numbers && base.options.settings.strings.numbers[number]) || number;
		return string.replace(/%d/i, value);
		}
		
		var words = seconds < 45 && substitute(base.options.settings.strings.seconds, Math.round(seconds)) ||
		seconds < 90 && substitute(base.options.settings.strings.minute, 1) ||
		minutes < 45 && substitute(base.options.settings.strings.minutes, Math.round(minutes)) ||
		minutes < 90 && substitute(base.options.settings.strings.hour, 1) ||
		hours < 24 && substitute(base.options.settings.strings.hours, Math.round(hours)) ||
		hours < 42 && substitute(base.options.settings.strings.day, 1) ||
		days < 30 && substitute(base.options.settings.strings.days, Math.round(days)) ||
		days < 45 && substitute(base.options.settings.strings.month, 1) ||
		days < 365 && substitute(base.options.settings.strings.months, Math.round(days / 30)) ||
		years < 1.5 && substitute(base.options.settings.strings.year, 1) ||
		substitute(base.options.settings.strings.years, Math.round(years));
		
		var separator = base.options.settings.strings.wordSeparator || "";
		if (base.options.settings.strings.wordSeparator === undefined) { separator = " "; }
		return $.trim([prefix, words, suffix].join(separator));
		},
		
		parse: function(iso8601) {
		var s = $.trim(iso8601);
		s = s.replace(/\.\d+/,""); // remove milliseconds
		s = s.replace(/-/,"/").replace(/-/,"/");
		s = s.replace(/T/," ").replace(/Z/," UTC");
		s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
		s = s.replace(/([\+\-]\d\d)$/," $100"); // +09 -> +0900
		return new Date(s);
		},
		datetime: function(elem) {
			//console.log(elem);
		var iso8601 = base.options.isTime(elem) ? $(elem).attr("datetime") : $(elem).attr("data-date");
		return  base.options.parse(iso8601);
		},
		isTime: function(elem) {
		return $(elem).get(0).tagName.toLowerCase() === "time";
		}
		
    };
    $.fn.time = function (options) {
        return this.each(function () {
            (new $.time(this, options));
        });
    };
	
})(jQuery);