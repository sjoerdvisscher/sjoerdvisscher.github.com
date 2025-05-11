_AP=Array.prototype;_NP=Number.prototype;_SP=String.prototype;
_AP.each=function(f) {
	for (var i=0;i<this.length;i++) f(this[i],i);
}
_AP.collect=function(f) {
	var a=[];
	for (var i=0;i<this.length;i++) a.append(f(this[i]));
	return a;
}
_AP.reduce=function(f,init) {
	var s=init||'';
	this.each(function(i){s=f(i,s)});
	return s;
}
_AP.append=function(x) {
	this[this.length]=x;
	return this;
}
_NP.times=function(f,_times_counter) {
	_times_counter=_times_counter||0;
	f(_times_counter);
	if(this>1) (this-1).times(f,_times_counter+1);
}
_NP.chr=function() {
	return String.fromCharCode(this);
}
_NP.to=function(n) {
	var a=(this==n)?[]:this.to(n-1);
	return a.append(n);
}
_SP.w=function(s) {
	return '<'+this+'>'+s+'</'+this.replace(/\s.*/,'')+'>';
}
_SP.asc=function() {
	return this.charCodeAt(0);
}
_SP.into=function(id) {
	document.getElementById(id).innerHTML=this;
}
_SP.setTo=function(s) {
	document.getElementById(this).innerHTML=s;
}
_SP.append=function(s) {
	document.getElementById(this).innerHTML+=s;
}
_SP.show=function() {
	document.getElementById(this).style.display='';
}
_SP.hide=function() {
	document.getElementById(this).style.display='none';
}
function inspect(o) {
	switch (typeof(o)) {
		case 'object':
			if (''+o.constructor==''+Array) {
				var s='';
				for (var i=0;i<o.length;i++) {
					s+='DIV style="padding-left:2em"'.w(i+': '+inspect(o[i]));
				};
				return '(array) '+(s||'[]');
			} else if (''+o.constructor==''+Date) {
				return '(date) '+o;
			}
			var s='';
			for (var i in o) {
				if (i.constructor==Function) continue;
				s+='DIV style="padding-left:2em"'.w(
					i+': '+inspect(o[i])
				);
			}
			return '(object)'+(s||'{}');
		default:
			var s='('+typeof(o)+') '+o;
			s=s.replace(/</g,'&lt;');
			return s;
	}
}