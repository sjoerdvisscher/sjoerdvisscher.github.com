var _FP = Function.prototype;
if ( typeof(parseInt["apply"]) != "function" ) {
	_FP.apply = function(obj, args) {
		var s, tmp;
		if ( obj ) {
			tmp = "tmp_" + Math.random();
			obj[tmp] = this;
			s = "obj[tmp](";
		}
		else
			s = "this(";
		for ( var i = 0 ; i < args.length ; ++i )
			s += "args[" + i + "],";
		s = ( args.length ? s.slice(0, -1) : s ) + ");";
		var r = eval(s);
		if ( obj )
			delete obj[tmp];
		return r;
	}
	_FP.call = function(obj) {
		return this.apply(obj, toArray(arguments).slice(1));
	}
}
_FP.andThen = function(f) {
	var self = this;
	eval("function f(" + argString(this) + ") {" +
		"return f(self.apply(this, arguments)); }");
	return f;
}
_FP.after = function(f) {
	return f.andThen(this);
}
_FP.curry = function(m) {
	var self = this;
	var origargs = argString(this).split(_FP.curry.re);
	if ( arguments.length != 1 || !m || typeof(m) != "object" ) {
		var callargs = toArray(arguments);
		eval("function f(" + origargs.slice(arguments.length).join(",") + ") {" +
			 "return self.apply(this,callargs.concat(toArray(arguments))); }");
	}
	else {
		var args = "";
		var callargs = origargs.foreach(function(a, i, r) {
			if ( typeof(m[a]) != "undefined" )
				return r + "m['" + a + "'],";
			if ( typeof(m[i]) != "undefined" )
				return r + "m[" + i + "],";
			if ( typeof(m[i - self.length]) != "undefined" )
				return r + "m[" + (i - self.length) + "],";
			args += a + ",";
			return r + a + ",";
		});
		eval("function f(" + args.slice(0, -1) + ") { return self.call(this," + callargs.slice(0, -1) + "); }");
	}
	return f;
}
_FP.curry.re = /\s*,\s*/;
_FP.foreach = function(a, r) {
	return a.foreach(f, r);
}
_FP.delay = function(iMilliSeconds) {
	var self = this;
	var f=function f() {
		 var args = arguments; +
		 return window.setTimeout(function() { self.apply(this, args); }, iMilliSeconds);
	}
	f._argString=this.argString();
	return f;
}
_FP.argString=function() {
	if (typeof(this["_argString"]) != "string")
		this._argString=this.toString().match(_FP.argString.re)[1];
	return this._argString;
}
_FP.argString.re = /\(([^)]*)/;

function makeFunction(obj, sMethod) {
	eval("function f(" + argString(obj[sMethod]) + ") {" +
		"var f = obj[sMethod];" +
		"if ( typeof(f['apply']) == 'function' )" +
			"return f.apply(obj, arguments);" +
		"var s = 'obj.' + sMethod + '(';" +
		"for ( var i = 0 ; i < arguments.length ; ++i )" +
			"s += 'arguments[' + i + '],';" +
		"s = ( arguments.length ? s.slice(0, -1) : s ) + ');';" +
		"return eval(s); }");
	return f;
}

function toArray(x) {
	if ( typeof(x["length"]) != "number" )
		return [].append(x);
	var a = new Array(x.length);
	for ( var i = 0 ; i < x.length ; ++i )
		a[i] = x[i];
	return a;
}

var _AP = Array.prototype;
_AP.append = function() {
	for ( var i = 0 ; i < arguments.length ; ++i )
		this[this.length] = arguments[i];
	return this;
}
_AP.foreach = function(f, r) {
	if ( typeof(r) == "undefined" )
		r = '';
	for ( var i = 0 ; i < this.length ; ++i )	
		r = f(this[i], i, r, this);
	return r;
}
_AP.collect = function(f) {
	var a = [];
	this.foreach(function(i) { a.append(f(i)); });
	return a;
}
_AP.search = function(f) {
	for ( var i = 0 ; i < this.length ; ++i )
		if ( f(this[i], i) )
			return i;
	return -1;
}

var _NP = Number.prototype;
_NP.times = function(f, counter) {
	counter = counter || 0;
	for ( var i = 0 ; i < this ; ++i )
		f(counter++);
}
_NP.upTo = function(target, step) {
	if ( !step )
		step = 1;
	var a = [];
	for ( var i = this ; i <= target ; i+= step )
		a.append(i);
	return a;
}
_NP.downTo = function(target, step) {
	if ( !step )
		step = 1;
	var a = [];
	for ( var i = this ; i >= target ; i-= step )
		a.append(i);
	return a;
}
_NP.to = function(target, step) {
	return this < target ? this.upTo(target, step) : this.downTo(target, step);
}
_NP.chr = function() {
	return String.fromCharCode(this);
}

var _SP = String.prototype;
_SP.foreach = function(f, r)
{
	return toArray(document.all[this]).foreach(f, r);
}
_SP.setTo = function(html)
{
	this.foreach(function(e) { e.innerHTML = html; });
	return this;
}
_SP.into = function(id)
{
	id.toString().setTo(this);
	return this;
}
_SP.add = function(where, html)
{
	this.foreach(function(e) { e.insertAdjacentHTML(where, html); });
	return this;
}
_SP.insert = _SP.add.curry("afterBegin");
_SP.append = _SP.add.curry("beforeEnd");
_SP.showHide = function(bShow)
{
	var display = bShow ? '' : 'none';
	this.foreach(function(e) { e.style.display = display; });
	return this;
}
_SP.show = _SP.showHide.curry(true);
_SP.hide = _SP.showHide.curry(false);
_SP.w = function(text)
{
	return "<" + this + ">" + text + "</" + this.replace(_SP.w.re, "") + ">";
}
_SP.w.re = /\s.*/;
_SP.tag = function(tag)
{
	return tag.toString().w(this);
}
_SP.write = function(s)
{
	return document.write(this.w(s));
}
_SP.asc = function() {
	return this.charCodeAt(0);
}
