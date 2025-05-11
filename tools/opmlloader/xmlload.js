/* server communication part */

document.write('<IFRAME id="xmlloadjs" height=0 style="border:none;margin:0px;"></IFRAME>');

w3f_XMLQueue={
	list:{},
	counter:0,
	current:0,
	add:function(url,xmlobj) {
		this.list[this.counter]={url:url,xmlobj:xmlobj}
		this.counter++;
		this.getNext();
	},
	getNext:function() {
		if (this.list[this.current]) {
			var o=this.list[this.current];
			document.getElementById('xmlloadjs').src='xmlparse.phtml?url='+escape(o.url)+'&onload='+escape('parent.w3f_XMLQueue.set('+this.current+',data);');
			this.xmlobj=o.xmlobj;
			delete this.list[this.current];
		}
	},
	set:function(nr,data) {
		this.xmlobj.parseData(data);
		this.current++;
		this.getNext();
	}
}

/* DOM implementation */
		
function w3f_XMLDocument() {}
w3f_XMLDocument.prototype={
	load:function(url) {
		this.url=url;
		w3f_XMLQueue.add(url,this);
	},
	parseData:function(data) {
		this.documentElement=new w3f_XMLNode(data,{ownerDocument:this});
		this.onload();
	},
	getSimpleTree:function() {
		return this.documentElement.getSimpleNode();
	}
}

function w3f_XMLNode(data,parent) {
	this.ownerDocument=parent.ownerDocument;
	this.parentNode=parent;
	if (data.n) {
		this.nodeType=1;
		this.nodeName=data.n;
		this.attributes=new w3f_XMLNamedNodeList(data.a);
		this.childNodes=new w3f_XMLNodeList(data.c||[],this);
	} else {
		this.nodeType=3;
		this.nodeValue=data;
	}
}
w3f_XMLNode.prototype={
	getSimpleNode:function() {
		var o={};
		for (var i=0;i<this.attributes.length;i++) o[this.attributes[i].nodeName]=this.attributes[i].nodeValue;
		if (this.childNodes) {
			var l=this.childNodes.length;
			if (l==1&&this.childNodes[0].nodeType==3) {
				o['#text']=this.childNodes[0].nodeValue;
				o.toString=function() {return this['#text']}
			} else for (var i=0;i<l;i++) {
				var c=this.childNodes[i];
				if (c.nodeType!=1) continue;
				var n=c.nodeName;
				if (!o[n]) {
					o[n]=c.getSimpleNode();
				} else if (!o[n][0]) {
					o[n]={'0':o[n],'1':c.getSimpleNode(),length:2};
				} else o[n][o[n].length++]=c.getSimpleNode();
			}
		} else o.toString=function() {return ''}
		return o;
	}
}

function w3f_XMLNodeList(list,parent) {
	this.length=list.length;
	for (var i=0;i<list.length;i++)
		this[i]=new w3f_XMLNode(list[i],parent);
}
w3f_XMLNodeList.prototype={
	item:function(i) {return this[i]}
}

function w3f_XMLNamedNodeList(list) {
	var l=0;
	if (list) for (var i in list) {
		this[i]=list[i];
		this[l++]={nodeType:2,nodeName:i,nodeValue:list[i]};
	}
	this.length=l;
}
w3f_XMLNamedNodeList.prototype={
	item:function(i) {return this[i]},
	getNamedItem:function(name) {return this[name]}
}

function w3f_ensureList(l) {
	if (!l) return {length:0};
	if (l[0]) return l;
	return {'0':l,length:1};
}

function w3f_listToArray(l) {
	if (!l) return [];
	if (l[0]) {
		var a=[];
		for (var i=0;i<l.length;i++) a[i]=l[i];
		return a;
	}
	return [l];
}