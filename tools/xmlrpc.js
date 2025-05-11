/* server communication part */

try {

document.write('<IFRAME id="xmlrpccl" src="/tools/xmlrpccl.phtml?queue=w3f_XMLRPCQueue" height=0 style="border:none;margin:0px;"></IFRAME>');

var w3f_XMLRPCQueue={
	list:{},
	counter:0,
	current:-1,
	add:function(xmlobj) {
		this.list[this.counter]=xmlobj;
		this.counter++;
		this.getNext();
	},
	getNext:function() {
		if (this.list[this.current]) {
			var o=this.list[this.current];
			this.form.url.value=o.url;
			this.form.inputXml.value=o.inputXml;
			this.form.number.value=this.current;
			this.form.submit();
			this.xmlobj=o;
			delete this.list[this.current];
		}
	},
	set:function(nr,data) {
		this.xmlobj.parseData(data);
		this.current++;
		this.getNext();
	},
	setForm:function(f) {
		this.form=f;
		if (this.current==-1) {
			this.current=0;
			this.getNext();
		}
	}
}

/* XML-RPC client */
function w3f_XMLRPCService(url) {
	this.url=url;
}
w3f_XMLRPCService.prototype={
	call: function(mname,args) {
		if (!this.onload) {
			alert('onload event is not specified yet.');
			return;
		}
		var s='<?xml version="1.0"?><methodCall><methodName>'+mname+'</methodName><params>';
		for (var i=0;i<args.length;i++) {
			s+='<param><value>'+this.JStoXMLRPC(args[i])+'</value></param>';
		}
		s+='</params></methodCall>';
		this.inputXml=s;
		w3f_XMLRPCQueue.add(this);
	},
	parseData: function(data) {
		this.data=data;
		this.parseData2();
		this.onload();
	},
	parseData2: function() {
		if (this.data.n=='!error') {
			this.error=this.data.a.text+' ('+this.data.a.code+')';
			return;
		}
		if (this.data.n!='methodResponse') {
			this.error='XML-RPC service returned unrecognized format. (root element: '+this.data.n+')';
			return;
		}
		this.tree=this.getSimpleTree(this.data);
		if (this.tree.fault) {
			var value=this.parseValue(this.tree.fault.value);
			this.error=value.faultString+' ('+value.faultCode+')';
			return;
		}
		this.result=this.parseValue(this.tree.params.param.value);
	},
	parseValue: function(val) {
		if (typeof(val)=='string'||val['#text']) return ''+val;
		if (val.struct) {
			var o={};
			var members=this.ensureList(val.struct.member);
			for (var i=0;i<members.length;i++) 
				o[members[i].name]=this.parseValue(members[i].value);
			return o;
		}
		if (val.array) {
			var a=[];
			var items=this.ensureList(val.array.data.value);
			for (var i=0;i<items.length;i++)
				a[i]=this.parseValue(items[i]);
			return a;
		}
		if (val.string) return ''+val.string;
		if (val['int']) return 1*val['int'];
		if (val.i4) return 1*val.i4;
		if (val['double']) return 1*val['double'];
		if (val['boolean']) return 1*val['boolean']==1;
		if (val["dateTime.iso8601"]) {
			var s=''+val["dateTime.iso8601"];
			return new Date(s.substr(0,4),1*s.substr(4,2)-1,s.substr(6,2),s.substr(9,2),s.substr(12,2),s.substr(15,2));
		}
	},
	ensureList:function(l) {
		if (!l) return {length:0};
		if (l[0]) return l;
		return {'0':l,length:1};
	},
	getSimpleTree:function(node) {
		var o=node.a||{};
		if (node.c&&node.c.length) {
			var l=node.c.length;
			if (l==1&&!node.c[0].n) {
				o['#text']=node.c[0];
				o.toString=function() {return this['#text']}
			} else for (var i=0;i<l;i++) {
				var c=node.c[i];
				if (!c.n) continue;
				var n=c.n;
				if (!o[n]) {
					o[n]=this.getSimpleTree(c);
				} else if (!o[n][0]) {
					o[n]={'0':o[n],'1':this.getSimpleTree(c),length:2};
				} else o[n][o[n].length++]=this.getSimpleTree(c);
			}
		} else o.toString=function() {return ''}
		return o;
	},
	JStoXMLRPC:	function(o) {
		switch (''+o.constructor) {
			case ''+Object:
				var s='';
				for (var i in o) try {
					if (o[i].constructor!=Function)
						s+='\n<member><name>'+i+'</name><value>'+this.JStoXMLRPC(o[i])+'</value></member>';
					} catch(e) {alert(i)}
				return '<struct>'+s+'</struct>';
			case ''+Boolean:
				return '<boolean>'+(o?'1':'0')+'</boolean>';
			case ''+Number:
				return '<int>'+Math.floor(o)+'</int>';
			case ''+String:
				return '<string>'+o.replace(/\&/g,'&amp;').replace(/\</g,'&lt;')+'</string>';
			case ''+Date:
				var m2=function(num) {return (num<10?'0'+num:''+num)}
				var s=o.getFullYear()+m2(o.getMonth()+1)+m2(o.getDate());
				s+='T'+m2(o.getHours())+':'+m2(o.getMinutes())+':'+m2(o.getSeconds());
				return '<dateTime.iso8601>'+s+'</dateTime.iso8601>';
			case ''+Array:
				var s='';
				for (var i=0;i<o.length;i++)
					s+='\n<value>'+this.JStoXMLRPC(o[i])+'</value>';
				return '<array><data>'+s+'</data></array>';
			default:return '';
		}
	}
}

function w3f_structToArray(o) {
	var i=0;var a=[];
	try {
		while (o[i].constructor) {
			a[i]=o[i];
			i++;
		}
	} catch(e) {};
	return a;
}

} catch(e) {err(e,'')}