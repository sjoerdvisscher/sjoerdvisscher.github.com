// the core
function OP(method, object, arg1, arg2) {
	this.method = method; this.object = object; this.arg1 = arg1; this.arg2 = arg2;
	this.proto = _CP;
}
OP.GET = function(obj, scope, key) {
	var o = obj.e(scope);
	var p = key.e(scope);
	if (!o[p]) return LoellFailure;
	if (o[p]==o.proto[p]) o[p]=NEW(o.proto[p]);
	return o[p];
}
OP.GETVAR = function(obj, scope, key) {
	var o = obj.e(scope);
	var p = key.e(scope);
	return o[p]||LoellFailure;
}
OP.SET = function(obj, scope, key, value) {
	return SET(obj.e(scope),key.e(scope),value.e(scope));
}
OP.SETVAR = function(obj, scope, key, value) {
	var s = obj.e(scope);
	var v = key.e(scope);
	while (s.proto&&typeof(s.proto[v])!='undefined') s=s.proto;
	return s[v]=value.e(scope);
}
OP.NEW = function(obj, scope, exprs) {
	var n=NEW(obj.e(scope));
	n.scope=scope;
	n['.'] = scope['.'];
	scope['.'] = scope['current'] = n;
	var initValue = LoellFailure;
	if (exprs) initValue = exprs.e(scope);
	if (n.init) APPLY(n, n.init, initValue);
	scope['current'] = scope['.'] = n['.'];
	return n
}
OP.EXPR = function(obj, scope) {
//	var closure = NEW(obj);
	var closure = NEW(_CP);
	closure.hd = obj.hd;
	closure.tl = obj.tl;
	closure.scope = scope;
	return closure
}
OP.EVAL = function(obj, scope, scopeOp) {
	var evalScope = scopeOp!=null?scopeOp.e(scope):OP.NEW(new OP(OP.GET, obj, 'scope'), scope);
	var closure = obj.e(scope);
	return EVAL(closure, evalScope);
}
OP.APPLY = function(obj, scope, method, arg) {
	var o = obj.e(scope);
	var m = typeof(method)=='string'?o[method]:method.e(scope);
	if (!m) {
		if (ISA(o, LoellFailure)) return o;
		var error = NEW(LoellFailure);
		error.message = "Method "+method+" not available for object: " + o;
		return error;
	}
	return APPLY(o, m, arg.e(scope));
}
OP.APPSET = function(obj, scope, mName, arg) {
	var o = obj.object.e(scope);
	var p = obj.arg1.e(scope);
	var m = o[p][mName];
	if (!m) {
		if (ISA(o[p], LoellFailure)) return o;
		var error = NEW(LoellFailure);
		error.message = "Method "+mName+" not available for object: " + o[p];
		return error;
	}
	return SET(o,p,APPLY(o[p], m, arg.e(scope)));
}
OP.SCOPE = function(obj, scope) {
	return scope
}
OP.LIST = function(obj, scope) {
	var result = NEW(_LP);
	var list = result;
	while (obj.hd) {
		var v=obj.hd.e(scope);
		if (ISA(v,LoellFailure)) return v;
		list.hd = v;
		list = list.tl = NEW(_LP);
		obj = obj.tl;
	}
	return result;
}

APPLY=function(o, m, a) {
	var newScope = NEW(m.scope);
	newScope['that']=a;
	newScope['.']=newScope['this']=o;
	return EVAL(m, newScope);
}

EVAL=function(c, s) {
	s=s||{};
	var oldClosure = s.closure;
	s.closure = c;
	var value = c.e(s);
	s.closure = oldClosure;
	return value;
}

var id=0;

NEW=function(o) {
	var f=function() {}; 
	f.prototype=o; 
	var n=new f();
	n.proto = o;
	n.id = id++;
	return n;
}

SET=function(o,p,v) {
/*	var test=true;
	var base = o.proto[p];
	if (typeof(base)!='undefined') test = ISA(v, base.proto);
	if (!test) {
		var error = NEW(LoellFailure);
		error.message = "Cannot set "+p+", "+v+" is the wrong type";
		return error;
	}*/
	return o[p]=v;
}

ISA=function(value, proto) {
	return (
		value==proto
	) || (
		(value!=Any) && ISA(value.proto, proto)
	);
}

CLOSURE=function(f) {
	var closure = NEW(_CP);
	closure.scope = {};
	closure.hd = f;
	closure.tl = NEW(_CP);
	return closure;
}

// built-in objects and methods
Any = {}
Any.proto = {};
Any.e = function() {return this};
_LP=NEW(Any);
_CP=NEW(_LP);
_FP=Function.prototype;
_FP.scope={};
_FP.proto=_CP;
_FP.e=function(s) {
	try {
		return this.apply(s['this'], [s['that'], s])
	} catch(e) {
		var error = NEW(LoellFailure);
		error.message = e.message || e;
		return error;
	}
}
Any['=='] = CLOSURE(function(o) {return (this==o)?this:LoellFailure});
Any['!='] = CLOSURE(function(o) {return (this!=o)?this:LoellFailure});
Any['then'] = CLOSURE(function(v) {
	var res=EVAL(v, v.scope);
	if (ISA(res, LoellFailure)) {
	  var o = NEW(Any);
	  o['else'] = CLOSURE(function() {return res});
	  return o;
	} else return res;
});
Any['else'] = CLOSURE(function(v) {return this});
Any['isA'] = CLOSURE(function(v) {return (ISA(this, v))?this:LoellFailure});
Any['!'] = CLOSURE(function(v) {return LoellFailure});
OP.prototype=NEW(Any);
OP.prototype.e=function(scope) {
	return this.method(this.object, scope, this.arg1, this.arg2)
}
_CP.e=function(scope) {
	var list = this;
	var v = LoellFailure;
	while (list.hd) {
		v=list.hd.e(scope);
		if (ISA(v,LoellFailure)) return v;
		list = list.tl;
	}
	return v;
}
_CP.toString=function(){return this.hd?this.hd+(this.tl.hd?'<br />'+this.tl:''):'';};
_CP['|']=CLOSURE(function(that) {
	var closure = CLOSURE(new OP(OP.APPLY, new OP(OP.EVAL, new OP(OP.EXPR, this)), 'else', new OP(OP.EXPR, that)));
	closure.scope = this.scope;
	return closure;
});
_LP.toString=function(){return this.hd?this.hd+'; '+this.tl:'';};
_LP.item=CLOSURE(function(i) {return i==0?(this.hd||LoellFailure):this.tl.item(i-1)});
_LP.all=CLOSURE(function(f) {
	var result = NEW(this.proto);
	var list = result;
	for (var obj = this; obj.hd; obj = obj.tl) {
		var v=APPLY(this, f, obj.hd);
		if (ISA(v,LoellFailure)) return v;
		list.hd = v;
		list = list.tl = NEW(this.proto);
	}
	return result;
});
_LP.some=CLOSURE(function(f) {
	var result = NEW(this.proto);
	var list = result;
	for (var obj = this; obj.hd; obj = obj.tl) {
		var v=APPLY(this, f, obj.hd);
		if (ISA(v,LoellFailure)) continue;
		list.hd = v;
		list = list.tl = NEW(this.proto);
	}
	return result;
});
_LP.filter=CLOSURE(function(f) {
	var result = NEW(this.proto);
	var list = result;
	for (var obj = this; obj.hd; obj = obj.tl) {
		var v=APPLY(obj.hd, f, obj.hd);
		if (ISA(v,LoellFailure)) continue;
		list.hd = obj.hd;
		list = list.tl = NEW(this.proto);
	}
	return result;
});
_LP['+']=CLOSURE(function(l) {
	var result = NEW(this.proto);
	var list = result;
	for (var obj = this; obj.hd; obj = obj.tl) {
		list.hd = obj.hd;
		list = list.tl = NEW(this.proto);
	}
	for (var obj = l; obj.hd; obj = obj.tl) {
		list.hd = obj.hd;
		list = list.tl = NEW(this.proto);
	}
	return result;
});
LoellNumber = function(n) {this.value=n;this.proto=_NP}
_NP=LoellNumber.prototype=NEW(Any);
_NP.e=function(s) {return this};
_NP.toString=function() {return this.value};
_NP['+']=CLOSURE(function(x) {return new LoellNumber(x==LoellFailure?+this.value:this.value + x.value)});
_NP['-']=CLOSURE(function(x) {return new LoellNumber(x==LoellFailure?-this.value:this.value - x.value)});
_NP['*']=CLOSURE(function(x) {return new LoellNumber(this.value * x.value)});
_NP['/']=CLOSURE(function(x) {return new LoellNumber(this.value / x.value)});
_NP['mod']=CLOSURE(function(x) {return new LoellNumber(this.value % x.value)});
_NP['==']=CLOSURE(function(x) {return (this.value-x.value==0)?this:LoellFailure});
_NP['!=']=CLOSURE(function(x) {return (this.value-x.value!=0)?this:LoellFailure});
_NP['lt']=CLOSURE(function(x) {return (this.value < x.value)?this:LoellFailure});
_NP['gt']=CLOSURE(function(x) {return (this.value > x.value)?this:LoellFailure});
_NP['lte']=CLOSURE(function(x) {return (this.value <= x.value)?this:LoellFailure});
_NP['gte']=CLOSURE(function(x) {return (this.value >= x.value)?this:LoellFailure});
_NP['to']=CLOSURE(function(x) {
	var list = NEW(_LP);
	if (x.value>=this.value) {
		list.hd = this;
		list.tl = APPLY(APPLY(this, this['+'], new LoellNumber(1)), this.to, x);
	}
	return list;
});
LoellString = function(s) {this.value=s;this.proto=_SP}
_SP=LoellString.prototype=NEW(Any);
_SP.e=function(s) {return this};
_SP.toString=function() {return this.value};
_SP['+']=CLOSURE(function(s) {return s==LoellFailure?new LoellNumber(+this.value):new LoellString(this.value+s.value)});
_SP['==']=CLOSURE(function(s) {return (this.value==s.value)?this:LoellFailure});
_SP['!=']=CLOSURE(function(s) {return (this.value!=s.value)?this:LoellFailure});
String.prototype.e=function(s) {return this};
LoellFailure=NEW(Any);
LoellFailure['then']=CLOSURE(function(v) {return this});
LoellFailure['else']=CLOSURE(function(v) {return EVAL(v,v.scope)});
LoellFailure['!']=CLOSURE(function(v) {return LoellSuccess});
LoellFailure.toString=function() {return (this.message?'ERROR: '+this.message:'failure')};
LoellSuccess=NEW(Any);
LoellSuccess.toString=function() {return 'success'};

function getGlobal() {
	var GLOBAL=NEW(Any);
	GLOBAL.Any=Any;
	GLOBAL.Number=_NP;
	GLOBAL.String=_SP;
	GLOBAL.List=_LP;
	GLOBAL.Closure=_CP;
	GLOBAL['failure']=LoellFailure;
	GLOBAL['success']=LoellSuccess;
	GLOBAL.id='GLOBAL';
	GLOBAL.toString=function() {return 'scope, id='+this.id}
	return GLOBAL;
}