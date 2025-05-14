/*
   BeyondLazy.JS
   by Dan Shappir and Sjoerd Visscher
   For more information see https://w3future.com/html/beyondJS
*/
if ( typeof(beyondVer) !== "number" || beyondVer < 0.98 )
	alert("beyondLazy requires Beyond JS library ver 0.98 or higher");
var beyondLazyVer = 0.95;

function Lazy(generator) {
	this.generator = generator ? generator : function() { return []; };
}
var _LP = Lazy.prototype;

Lazy.cache = true;

_LP.foreach = function(f) {
	var item = [];
	for ( var i = 0 ; (item = this.generator(item)).length ; ++i )
		if ( f(item[0], i, this) === false )
			return i;
	return -1;
};
_LP.collect = function(f) {
	var self = this;
	if ( typeof(f) == "string" ) f = f.toFunction();
	return function(prev) {
		var current = self.generator(isDefined(prev[1]) ? prev[1] : []);
		return current.length ? [ f(current[0], prev[0]), current ] : current;
	}.lazy();
};
_LP.asLongAs = function(f) {
	var self = this;
	if ( f.constructor === RegExp )
		f = Function.from(f, "test");
	return function(prev) {
		var current = self.generator(prev);
		return current.length && f(current[0]) ? current : [];
	}.lazy();
};
_LP.filter = function(f, other) {
	var self = this;
	if ( f.constructor === RegExp )
		f = Function.from(f, "test");
	return function(item) {
		while ( (item = self.generator(item)).length && !f(item[0]) )
			if ( other )
				other.append(item[0]);
		return item;
	}.lazy();
};
_LP.zip = function() {
	var collections = [ this ].concat(Array.from(arguments).collect(Function.from(null, "lazy")));
	return function(prev) {
		if ( !prev.length )
			(collections.length+1).times(function() { prev.push([]); });
		var current = [ [] ];
		collections.foreach(function(c, i) {
			var x = c.generator(prev[i+1]);
			if ( !x.length ) {
				current = [];
				return false;
			}
			current[0].push(x[0]);
			current.push(x);
		});
		return current;
	}.lazy();
};
_LP.zipWith = _AP.zipWith;

_LP.head = function(length) {
	if ( !length ) return this.generator([])[0];
	return this.collect(function(current, prev) { return [ current, isUndefined(prev) ? 0 : prev[1]+1 ]; }).
			asLongAs(function(current) { return current[1] < length; }).
			collect(function(current) { return current[0]; });
};
_LP.tail = function(start) {
	if ( !start ) start = 1;
	return this.collect(function(current, prev) { return [ current, isUndefined(prev) ? 0 : prev[1]+1 ]; }).
			filter(function(current) { return current[1] >= start; }).
			collect(function(current) { return current[0]; });
};
_LP.slice = function(start, end) {
	var result = start ? this.tail(start) : this;
	if ( isDefined(end) ) end -= start;
	return end >= 1 ? result.head(end) : result;
};
_LP.isEmpty = function() {
	return !this.generator([]).length;
};
_LP.itemAt = function(index) {
	var r;
	this.slice(index, index+1).foreach(function(v) { r = v; });
	return r;
};
_LP.empty = function() {
	this.generator = function() {
		return [];
	};
	return this;
};

_LP.toString = function() {
	return Array.from(this).toString();
};
_LP.toLocaleString = function() {
	return Array.from(this).toLocaleString();
};
_LP.valueOf = function() {
	return Array.from(this).valueOf();
};
_LP.join = function(separator) {
	var a = Array.from(this);
	return isDefined(separator) ? a.join(separator) : a.join();
};
_LP.concat = function() {
	var a = [ this ].concat(Array.from(arguments)).filter(isDefined).collect(function(v) {
		return v != null && v.constructor == Array ? v.lazy() : v;
	});
	return a.length == 1 ? this : function(prev) {
		if ( !prev.length ) prev = [ null, [], 0 ];
		for (;;) {
			var current = a[prev[2]];
			if ( isUndefined(current) )
				return [];
			if ( current === null || typeof(current.constructor) !== "function" || current.constructor !== Lazy )
				return [ current, [], prev[2]+1 ];
			current = current.generator(prev[1]);
			if ( current.length )
				return [ current[0], current, prev[2] ];
			prev = [ null, [], prev[2]+1 ];
		}
	}.lazy();
};
_LP.push = _LP.append = function() {
	var a = Array.from(arguments).filter(isDefined);
	if ( a.length ) {
		var generator = this.generator;
		this.generator = function(prev) {
			if ( isUndefined(prev[2]) ) {
				var current = generator(prev);
				if ( current.length )
					return current;
				prev = [ null, null, 0 ];
			}
			return isDefined(a[prev[2]]) ? [ a[prev[2]], null, prev[2]+1 ] : [];
		};
	}
	return this;
};
_LP.shift = function() {
	var result = this.head();
	if ( isDefined(result) )
		this.generator = this.generator.lazy().tail().generator;
	return result;
};
_LP.unshift = function() {
	var a = Array.from(arguments).filter(isDefined);
	if ( a.length )
		this.generator = a.lazy().concat(this.generator.lazy()).generator;
	return this;
};
_LP.splice = function(start, deleteCount) {
	var a = Array.from(arguments).slice(2).filter(isDefined);
	var clone = this.generator.lazy();
	var result = clone.tail(start+deleteCount);
	if ( a.length ) result = a.lazy().concat(result);
	if ( start > 0 ) result = clone.head(start).concat(result);
	this.generator = result.generator;
	return clone.slice(start, start+deleteCount);
};

_LP.extend = function(x) {
	if ( isDefined(x) ) {
		var generator = this.generator;
		this.generator = function(prev) {
			if ( !prev.length ) prev = [ null, prev, generator ];
			var current = prev[2](prev[1]);
			if ( current.length )
				return [ current[0], current, prev[2] ];
			if ( typeof(x) == "function" )
				x = x().lazy();
			if ( prev[2] === x.generator )
				return current;
			current = x.generator(current);
			return current.length ? [ current[0], current, x.generator ] : current;
		};
		if ( Lazy.cache )
			return this.cached();
	}
	return this;
};

_LP.cached = function() {
	if ( isUndefined(this.isCached) ) {
		this.isCached = true;
		var cache = [], generator = this.generator;
		this.generator = function(prev) {
			if ( !prev.length )
				prev = [ null, [], 0 ];
			if ( prev[2] < cache.length )
				return cache[prev[2]];
			var current = generator(prev[1]);
			return cache[cache.length] = current.length ? [ current[0], current, cache.length+1 ] : [];
		}
	}
	return this;
};

_LP.lazy = Function.This;

_FP.lazy = function() {
	return new Lazy(this);
};

_NP.lazyUp = function(end, step) {
	var undef, start = this.valueOf();
	if ( isUndefined(end) || end === null ) end = Number.POSITIVE_INFINITY;
	if ( !(step > 0) ) step = 1;
	return function(item) {
		if ( !item.length ) return [ start, undef ];
		var value = item[0] + step;
		return value <= end ? [ value, undef ] : [];
	}.lazy();
};
_NP.lazyDown = function(end, step) {
	var undef, start = this.valueOf();
	if ( isUndefined(end) || end === null ) end = Number.POSITIVE_INFINITY;
	if ( !(step > 0) ) step = 1;
	return function(item) {
		if ( !item.length ) return [ start, undef ];
		var value = item[0] - step;
		return value >= end ? [ value, undef ] : [];
	}.lazy();
};
_NP.lazy = function(end, step) {
	if ( isUndefined(end) || end === null ) end = Number.POSITIVE_INFINITY;
	return this < end ? this.lazyUp(end, step) : this.lazyDown(end, step);
};

_SP.lazy = function(target, step) {
	return this.asc().lazy(target.toString().asc(), step).collect(Function.from(null, "chr"));
};

_AP.lazy = function() {
	var self = this;
	return function(item) {
		var index = item[1] ? item[1] : 0;
		return index < self.length ? [ self[index], index+1 ] : [];
	}.lazy();
};

if ( _EP )
	_EP.lazy = function() {
		var self = this;
		return function(item) {
			if ( !item.length )
				self.moveFirst();
			else
				self.moveNext();
			return !self.atEnd() ? [ self.item(), self ] : [];
		}.lazy();
	};

Lazy.from = function(x) {
	if ( typeof(x.lazy) == "function" )
		return x.lazy();
	if ( typeof(x.length) == "number" )
		return this.fill(function(index, item) { return x[index]; });
	return Array.from(x).lazy();
};
Lazy.fill = function(f) {
	var lazy = function(item) {
		var index = item[1] ? item[1] : 0;
		var value = f(index, item[0]);
		return isDefined(value) ? [ value, index+1 ] : [];
	}.lazy();
	return this.cache ? lazy.cached() : lazy;
};
Lazy.recurse = Array.recurse;
iteratable(Lazy);
