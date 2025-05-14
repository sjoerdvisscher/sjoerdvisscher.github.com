/*
	beyond.js
	by Dan Shappir and Sjoerd Visscher
	For more information see https://w3future.com/html/beyondJS
*/
var beyondVer = 0.99;

var _FP = Function.prototype;
if ( typeof(parseInt.apply) != "function" ) {
	_FP.apply = function(obj, args) {
		var s, tmp;
		if ( obj ) {
			tmp = "__tmp__";		// + Math.random();
			switch ( typeof(obj) ) {
				case "string":
					s = "'" + obj.replace(_FP.apply.re, "\\'") + "'";
					_SP[tmp] = this;
					break;
				case "number":
					s = "(" + obj + ")";
					_NP[tmp] = this;
					break;
				default:
					s = "obj";
					obj[tmp] = this;
					break;
			}
			s = "var r = " + s + "." + tmp + "(";
		}
		else
			s = "var r = this(";
		for ( var i = 0 ; i < args.length ; ++i )
			s += "args[" + i + "],";
		s = ( args.length ? s.slice(0, -1) : s ) + ");";
		eval(s);
		return r;
	};
	_FP.apply.re = /\'/g;
	_FP.call = function(obj) {
		return this.apply(obj, Array.from(arguments).slice(1));
	};
}

function isUndefined(x) {
	var t = typeof(x);
	return t == "undefined" || t == "unknown";
}
function isDefined(x) {
	return !isUndefined(x);
}

Object.propertyNames = function(x, a) {
	if ( !a ) a = [];
	for ( var i in x )
		a.append(i);
	return a;
};
Object.propertyValues = function(x, a) {
	return Object.propertyNames(x).collect(Function.from(x, null), a);
};
Object.from = function(n, v, x) {
	if ( !x ) x = {};
	var length = Math.min(n.length, v.length);
	for ( var i = 0 ; i < length ; ++i )
		x[n[i]] = v[i];
	return x;
};

_FP.withArgString = function(x) {
	if ( !x ) return this;
	if ( typeof(x) != "string" )
		x = Function.argString(x);
	var self = this;
	eval("function __withArgString__(" + x + ") { return self.apply(this, arguments); }");
	return __withArgString__;
};
_FP.curry = function(m) {
	var self = this;
	var map = arguments.length != 1 || !m || typeof(m) != "object" ? arguments : m;
	function createApplyArg(x) {
		var val = map[x];
		if ( val && val.asArgNameFlag ) {
			args.append(val.toString());
			return val.toString();
		}
		var arg = "__curry__.map['" + x + "']";
		if ( typeof(val) == "function" && val.asValueFlag ) {
			var list = addArgs(val);
			if ( list.length ) list = "," + list;
			arg += ".call(this" + list + ")";
		}
		return arg;
	}
	function addArgs(f) {
		var args = Function.argString(f);
		if ( !args )
			return "";
		args.split(_FP.curry.re).foreach(function(arg) {
			if ( argSet.addToSet(arg) )
				extraArgs.append(arg);
		});
		return args;
	}
	var origargs = Function.argString(this);
	origargs = origargs ? origargs.split(_FP.curry.re) : [];
	if ( map !== m && origargs.length < arguments.length ) origargs.length = arguments.length;
	var args = [], extraArgs = [], argSet = new stringSet;
	var applyArgs = origargs.collect(function(a, i) {
		if ( isUndefined(a) ) {
			if ( isDefined(map[i]) )
				return createApplyArg(i);
			a = "arg" + i;
			args.append(a);
			return a;
		}
		if ( isDefined(map[a]) )
			return createApplyArg(a);
		if ( isDefined(map[i]) )
			return createApplyArg(i);
		if ( isDefined(map[i - self.length]) )
			return createApplyArg(i - self.length);
		args.append(a);
		return a;
	});
	eval("function __curry__(" + args.concat(extraArgs).join(",") + ") {" +
		 "return self.apply(this, " +
			(applyArgs.length == 1 ? "[].append(" + applyArgs[0] + ")" : "[" + applyArgs.join(",") + "]") +
		 "); }");
	__curry__.map = map;
	return __curry__;
};
_FP.curry.re = /\s*,\s*/;
_FP.using = function() {
	return this.curry(Array.from(arguments).collect(select.curry({
		prep : "typeof",
		map : {
			"function" : function(x) { return x.asValue(); },
			"string" : function(x) { return x.asArgName(); },
			"undefined" : function(x) { return x; }
		}
	})));
};

_FP.andThen = function(f) {
	eval("function first(" + Function.argString(this) + ") { return g.first.apply(this, arguments); }");
	function second(x) {
		return g.second.apply ? g.second.apply(this, arguments) : g.second(x);
	}
	var g = second.using(first);
	g.first = this;
	g.second = typeof(f) != "string" ? f : Function.from(null, f);
	return g;
};
_FP.andReturn = function(v) {
	return this.andThen(Function.from(v));
};
_FP.replace = function(orig, replace) {
	if ( !replace )
		replace = Function.NOP;
	if ( this.second == orig )
		this.second = replace;
	else for ( var f = this ; f.second ; f = f.second )
		if ( f.first == orig )
			f.first = replace;
	return this;
};

_FP.strict = function(args) {
	var self = this, type = typeof(args), length;
	if ( type == "number" )
		length = args;
	if ( type != "string" )
		args = Function.argString(this);
	if ( type != "number" )
		length = args.split(",").length;
	return function() {
		return self.apply(this, Array.from(arguments).head(length));
	}.withArgString(args);
};

_FP.foreach = function(a) {
	if ( typeof(a.foreach) != "function" )
		a = Array.from(a);
	return a.foreach(this);
};
_FP.delay = function(iMilliSeconds) {
	var self = this;
	return function() {
		var args = arguments;
		return window.setTimeout(function() { self.apply(this, args); }, iMilliSeconds);
	}.withArgString(this);
};
_FP.asValue = function() {
	var f = this.curry({});
	f.asValueFlag = true;
	return f;
};
_FP.toMethod = function() {
	return this.using(Function.This);
};
_FP.gate = function(cond, els) {
	var gate = function() {
		return ( typeof(gate.cond) == "function" ? gate.cond.apply(this, arguments) : gate.cond ) ?
			gate.then.apply(this, arguments) :
			typeof(gate.els) == "function" ? gate.els.apply(this, arguments) : gate.els;
	}.withArgString(this);
	gate.cond = cond;
	gate.then = this;
	gate.els = els;
	return gate;
};
_FP.loop = function(cond) {
	var loop = function() {
		while ( select(loop.cond, {
					"function" : function(x) { return x.apply(this, arguments); },
					"number" : function() { return loop.cond--; },
					"undefined" : isDefined(loop.cond) ? loop.cond : true
				}, "typeof") ) {
			var r = loop.action.apply(this, arguments);
			if ( isDefined(r) )
				return r;
		}
	}.withArgString(this);
	loop.cond = cond;
	loop.action = this;
	return loop;
};

_FP.factory = function() {
	var self = this;
	return function() {
		return eval("new self(" +
			(0).upTo(arguments.length-1).join2("arguments[", ",", "]") +
			")");
	}.withArgString(this);
};

Function.argString = function(f) {
	var result = ("" + f).match(Function.argString.re);
	return result ? result[1] : null;
};
Function.argString.re = /\(([^)]*)/;
Function.NOP = function() {
	if ( arguments.length > 0 )
		return arguments[0];
};
Function.This = function() {
	return this;
};
Function.args = function() {
	return Array.from(arguments);
};
Function.invoke = function(f) {
	return f();
};
Function.event = function(e) {
	return e ? e : event;
};

Function.from = function(obj, field, args) {
	var f;
	if ( isUndefined(obj) || obj === null ) {
		f = function(obj) {
			return Function.from(obj, f.field, args).apply(obj, Array.from(arguments).slice(1));
		};
		if ( args && args.length )
			f = f.withArgString("obj," + args);
	}
	else if ( isUndefined(field) ) {
		if ( !args )
			args = Function.argString(obj);
		if ( typeof(args) != "string" )
			f = function() {
				return f.obj;
			};
		else
			f = function() {
				return f.obj.apply(this, arguments);
			}.withArgString(args);
	}
	else if ( field === null )
		f = function(x) {
			return f.obj[x];
		};
	else if ( typeof(field) == "function" )
		f = function() {
			return f.field.apply(f.obj, arguments);
		}.withArgString(args ? args : Function.argString(field));
	else {
		if ( !args )
			args = Function.argString(obj[field]);
		if ( typeof(args) != "string" )
			f = function() {
				if ( f.field.search(/\s/) > -1 )
					return f.obj[f.field];
				return eval("f.obj." + f.field);
			};
		else
			f = function() {
				if ( f.field.search(/\s/) > -1 )
					return f.obj[f.field].apply(f.obj, arguments);
				var s = "f.obj." + f.field + "(";
				Array.from(arguments).foreach(function(v, i) { s += "arguments[" + i + "],"; });
				return eval(( arguments.length ? s.slice(0, -1) : s ) + ");");
			}.withArgString(args);
	}
	f.obj = obj;
	f.field = field;
	return f;
}
Function.set = function(obj, property) {
	var f;
	if ( isUndefined(obj) || obj === null )
		f = function(obj, value) {
			return Function.set(obj, f.property).call(this, value);
		};
	else if ( isUndefined(property) )
		f = function(property, value) {
			return Function.set(f.obj, property).call(this, value);
		};
	else
		f = function(value) {
			if ( f.property.search(/\s/) > -1 )
				f.obj[f.property] = value;
			else
				eval("f.obj." + f.property + " = value");
			return value;
		}
	f.obj = obj;
	f.property = property;
	return f;
}

var _AP = Array.prototype;
if ( typeof(_AP.push) != "function" )
	_AP.push = function() {
		for ( var i = 0 ; i < arguments.length ; ++i )
			this[this.length] = arguments[i];
		return this.length;
	}
if ( typeof(_AP.pop) != "function" )
	_AP.pop = function() {
		if ( this.length ) {
			var item = this[this.length-1];
			--this.length;
			return item;
		}
	}
if ( typeof(_AP.shift) != "function" )
	_AP.shift = function() {
		this.foreach(function(v, i, self) { self[i] = self[i+1]; });
		--this.length;
		return this;
	}
if ( typeof(_AP.unshift) != "function" )
	_AP.unshift = function() {
		var self = this;
		Array.from(arguments).concat(this).foreach(function(v, i) { self[i] = v; });
		return this;
	}
if ( typeof(_AP.splice) != "function" )
	_AP.splice = function(start, deleteCount) {
		var a = start > 0 ? this.slice(0, start) : [];
		a = a.concat(Array.from(arguments).slice(2), this.slice(start+deleteCount));
		var self = this, deleted = this.slice(start, start+deleteCount);
		a.foreach(function(v, i) { self[i] = v; });
		this.length = a.length;
		return deleted;
	}

_AP.head = function(length) {
	return isUndefined(length) ? this[0] : this.slice(0, length);
};
_AP.tail = function(start) {
	return this.slice(start ? start : 1);
};
_AP.itemAt = function(i) {
	return this[i];
};
_AP.isEmpty = function() {
	return this.length === 0;
};
_AP.empty = function() {
	this.length = 0;
	return this;
};

_AP.join2 = function(prefix, infix, postfix) {
	if ( isUndefined(prefix) || prefix === null ) prefix = "";
	if ( isUndefined(infix) || infix === null ) infix = "";
	if ( isUndefined(postfix) || postfix === null ) postfix = "";
	var r = this.join(postfix + infix + prefix);
	return r.length ? prefix + r + postfix : r;
};

_AP.append = function() {
	for ( var i = 0 ; i < arguments.length ; ++i )
		if ( isDefined(arguments[i]) )
			this[this.length] = arguments[i];
	return this;
};
_AP.extend = function(x) {
	if ( isDefined(x) ) {
		if ( typeof(x.foreach) == "function" )
			x.foreach(function(v) { this.append(v); });
		else
			this.append(x);
	}
	return this;
};

_AP.foreach = function(f) {
	for ( var i = 0 ; i < this.length ; ++i )
		if ( f(this[i], i, this) === false )
			return i;
	return -1;
};
_AP.coalesce = function(f, r) {
	this.foreach(function(v, i, self) { r = f(r, v, i, self); });
	return r;
};
_AP.fold = function(f, r) {
	if ( typeof(f) == "string" ) f = f.toFunction();
	return this.coalesce(function(r, v) {
		return isDefined(r) ? f(r, v) : v;
	}, r);
};
_AP.foldr = function(f, r) {
	if ( typeof(f) == "string" ) f = f.toFunction();
	return this.fold(function(r, v) { return f(v, r); }, r);
};
_AP.collect = function(f, a) {
	if ( typeof(f) == "string" ) f = f.toFunction();
	if ( !a ) a = this.constructor ? new this.constructor : [];
	return this.coalesce(function(r, v, i, self) { return r.append(f(v, i, self)); }, a);
};

_AP.asLongAs = function(f, a) {
	if ( f.constructor === RegExp )
		f = Function.from(f, "test");
	if ( !a ) a = this.constructor ? new this.constructor : [];
	this.foreach(function(v, i, self) {
		if ( !f(v, i, self) ) return false;
		a.append(v);
	});
	return a;
};
_AP.filter = function(f, other) {
	if ( f.constructor === RegExp )
		f = Function.from(f, "test");
	return this.collect(other ?
		function(v, i, a) {
			if ( f(v, i, a) )
				return v;
			other.append(v);
		} :
		function(v, i, a) {
			if ( f(v, i, a) )
				return v;
		}
	);
};
_AP.search = function(f) {
	if ( f.constructor === RegExp )
		f = Function.from(f, "test");
	else if ( typeof(f) != "function" ) {
		var x = f;
		f = function(y) { return y === x; };
	}
	return this.foreach(function(v, i, self) { return !f(v, i, self); });
};
_AP.indexOf = function(pattern) {
	if ( typeof(pattern.foreach) != "function" )
		pattern = [].append(pattern);
	return this.foreach(function(v, i, self) {
		return -1 !== pattern.foreach(function(v) {
			return v === self[i++];
		});
	});
};

_AP.flush = function(f) {
	for ( ; this.length ; this.shift() )
		if ( f(this[0], this) === false )
			break;
	return this;
};
_AP.split = function(f) {
	if ( f.constructor === RegExp )
		f = Function.from(f, "test");
	else if ( typeof(f) != "function" )
		f = "===".curry({ 0 : f });
	var a = [[]], index = 0;
	this.foreach(function(v) {
		if ( f(v) )
			a[++index] = [];
		else
			a[index].append(v);
	});
	return a;
};
_AP.zip = function() {
	var result = this.collect(function(v) { return Function.args(v); });
	Array.from(arguments).foreach(function(a) {
		if ( !a || isUndefined(a.foreach) )
			a = Function.args(v);
		var last = 0;
		if ( a.foreach(function(v, i) {
			var x = result.itemAt(i);
			if ( isUndefined(x) ) return false;
			x.push(v);
			last = i;
		}) == -1 ) {
			if ( isDefined(result.length) )
				result.length = last+1;
			else
				result = result.slice(0, last+1);
		}
	});
	return result;
};
_AP.zipWith = function(f) {
	if ( typeof(f) == "string" ) f = f.toFunction();
	return this.zip.apply(this, Array.from(arguments).tail()).collect(function(v) {
		return f.apply(null, v);
	});
};

Array.from = function(x) {
	if ( typeof(x.toArray) == "function" ) {
		x = x.toArray();
		if ( this === Array )
			return x;
	}
	if ( typeof(x.foreach) == "function" ) {
		var a = new this;
		x.foreach(function(v) { a.push(v); });
		return a;
	}
	if ( typeof(x.length) == "number" ) {
		var a = new this;
		if ( typeof(x) != "string" )
			for ( i = 0 ; i < x.length ; ++i )
				a.push(x[i]);
		else
			for ( i = 0 ; i < x.length ; ++i )
				a.push(x.charAt(i));
		return a;
	}
	return (new this).push(x);
}
Array.fill = function(f, a) {
	if ( !a ) a = new this;
	var i = a.length;
	if ( !i ) i = 0;
	for ( ; ; ++i ) {
		var v = f(i, a);
		if ( isUndefined(v) )
			return a;
		a.append(v);
	}
};
Array.recurse = function(f, resultIfEmpty) {
	if ( isUndefined(resultIfEmpty) ) resultIfEmpty = new this;
	return function() {
		return this.isEmpty() ? resultIfEmpty : f(this.head(), this.tail());
	};
};

function iteratable(x) {
	var p = x.prototype;
	if ( !p || p == Object )
		p = x;
	else {
		if ( typeof(p.push) == "function" ) {
			if ( !x.from )
				x.from = Array.from;
		}
		if ( typeof(p.append) == "function" ) {
			if ( !x.fill )
				x.fill = Array.fill;
		}
	}
	if ( typeof(p.foreach) == "function" ) {
		if ( !p.coalesce )
			p.coalesce = _AP.coalesce;
		if ( !p.fold )
			p.fold = _AP.fold;
		if ( !p.foldr )
			p.foldr = _AP.foldr;
		if ( !p.collect )
			p.collect = _AP.collect;
		if ( !p.filter )
			p.filter = _AP.filter;
		if ( !p.search )
			p.search = _AP.search;
	}
}

var _NP = Number.prototype;
_NP.times = function(f, counter) {
	counter = counter || 0;
	for ( var i = 0 ; i < this ; ++i )
		f(counter++);
};
_NP.upTo = function(target, step) {
	if ( !step ) step = 1;
	var a = [];
	for ( var i = this.valueOf() ; i <= target ; i += step )
		a.append(i);
	return a;
};
_NP.downTo = function(target, step) {
	if ( !step ) step = 1;
	var a = [];
	for ( var i = this.valueOf() ; i >= target ; i -= step )
		a.append(i);
	return a;
};
_NP.to = function(target, step) {
	return this < target ? this.upTo(target, step) : this.downTo(target, step);
};
_NP.chr = function() {
	return String.fromCharCode(this);
};

var _SP = String.prototype;
_SP.itemAt = String.charAt;
_SP.asc = function() {
	return this.charCodeAt(0);
};
_SP.to = function(target, step) {
	return this.asc().to(target.toString().asc(), step).collect(Function.from(null, "chr"));
};
_SP.toFunctionUnary = function() {
	eval("function __unary__(op) { return " + this + " op; }");
	__unary__.op = this;
	return __unary__;
};
_SP.toFunctionBinary = function() {
	eval("function __binary__(op1, op2) { return op1 " + this + " op2; }");
	__binary__.op = this;
	return __binary__;
};
_SP.toFunction = function() {
	return ",!,~,++,--,new,delete,typeof,void,".indexOf("," + this + ",") > -1 ?
		this.toFunctionUnary() : this.toFunctionBinary();
};
_SP.toMethod = function() {
	return this.toFunction().toMethod();
};
_SP.apply = function(obj, args) {
	return this.toFunction().apply(obj, args);
};
_SP.call = function(obj) {
	return this.toFunction().apply(obj, Array.from(arguments).slice(1));
};
_SP.curry = function() {
	return _FP.curry.apply(this.toFunction(), arguments);
};
_SP.using = function() {
	return _FP.using.apply(this.toFunction(), arguments);
};
_SP.asArgName = function() {
	var self = this;
	return { toString : function() { return self; }, asArgNameFlag : true };
};

var _RP = RegExp.prototype;
_RP.iterate = function(s, f) {
	var sre = this.toString(), sep = sre.lastIndexOf("/");
	var re = new RegExp(sre.slice(1, sep), sre.slice(sep+1) + "g");
	for ( var a ; a = re.exec(s) ; )
		if ( f(a, s, re) === false )
			return a;
	return null;
};

if ( typeof(Enumerator) == "function" && typeof(Enumerator.prototype) == "object" ) {
	var _EP = Enumerator.prototype;
	_EP.foreach = function(f) {
		for ( this.moveFirst() ; !this.atEnd() ; this.moveNext() )
			if ( f(this.item(), this) === false )
				return this.item();
		return null;
	};
	iteratable(Enumerator);
}

function select(selector, map, prep) {
	switch ( typeof(prep) ) {
		case "string":
			prep = prep.toFunction();
		case "function":
		case "object":
			if ( prep ) {
				r = map[prep(selector, this)];
				break;
			}
		default:
			r = map[selector];
	}
	if ( isUndefined(r) ) r = map[r];
	return typeof(r) == "function" ? r.call(this, selector, prep) : r;
}

function stringSet(initItems) {
	if ( initItems )
		this.addToSet.apply(this, initItems);
}
stringSet.prototype = {
	addToSet : function(item) {
		var set = this;
		return Array.from(arguments).coalesce(function(r, item) {
			return !set[item] ? set[item] = true : r;
		}, false);
	},
	foreach : function(f) {
		for ( var item in this )
			if ( this[item] !== stringSet.prototype[item] && f(item, this) === false )
				return item;
		return null;
	},
	mergeSet : function(set) {
		return Array.from(this).concat(Array.from(set)).toStringSet();
	},
	include : function() {
		return "&&".using(
			Function.from(this, null),
			Function.from(stringSet.prototype, null).andThen(isUndefined));
	},
	exclude : function() {
		return this.include().andThen("!".toFunctionUnary());
	}
};
_AP.toStringSet = function() {
	return new stringSet(this);
};

Math.even = function(n) {
	return n % 2 == 0;
};
Math.odd = function(n) {
	return n % 2 != 0;
};

function debugAlert(x) {
	if ( debugAlert.on )
		Array.from(arguments).foreach(alert);
	if ( arguments.length > 0 )
		return x;
}
debugAlert.on = true;
