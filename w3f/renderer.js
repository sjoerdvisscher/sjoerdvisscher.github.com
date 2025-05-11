status='w3future.com';

function Compartment(values) {
	this.compartments={};
	this.options={};
	for (var i in values) this[i]=values[i];
}

Compartment.prototype={
	update: function() {
		this.item=top.getObject(this.forItem);
		this.target=document.getElementById(this.id);
		if (!this.target) return false;
		if (this.toParent) {
			this.target=this.target.parentNode;
			this.target.id=this.id;
			this.toParent=false;
		}
		var result=this.callTemplate(this.how,this.item);
		this.target.innerHTML=result.s;
		this.target.className=result.className||this.how;
		if (result.action||this.item.action) {
			this.target.title=result.title||this.item.title||'w3future.com';
			this.target.help=result.help||this.item.help||'';
			this.target.onmouseover=new Function('',"this.className='"+(result.className||this.how)+"-hover';window.status=this.title;w3f_setHelp(this)");
			this.target.onmouseout=new Function('',"this.className='"+(result.className||this.how)+"';window.status='w3future.com';w3f_clearHelp()");
			this.target.onclick=new Function('',result.action||this.item.action);
		}
		for (var i in this.compartments) {
			var c=this.compartments[i];if (!c) continue;			
			if (!c.update()) this.compartments[i]=false;
		}
		return true;
	},
	register: function(a) {
		if (a.forItem.charAt(0)=='.'||a.forItem.charAt(0)=='[') a.forItem=this.item.id+a.forItem;
		a.toParent=true;
		this.compartments[a.id]=a;
		return '<SPAN id="'+a.id+'"></SPAN>';
	},
	callTemplate: function(how,i) {
		var o={s:'',toString:function(){return this.s}};
switch (how) {
case 'container':
	i.beforeRows=i.beforeRows||'<TABLE class="'+i.contentHow+'-container" cellspacing=0 cellpadding=0><TR>';
	i.betweenRows=i.betweenRows||'</TR><TR>';
	i.afterRows=i.afterRows||'</TR></TABLE>';
	i.beforeCols=i.beforeCols||'<TD>';
	i.betweenCols=i.betweenCols||'</TD><TD>';
	i.afterCols=i.afterCols||'</TD>';
	i.empty=i.empty||'&nbsp;';
	i.cols=i.cols||1;
	i.max=i.max||64;
	if (i.header) {
		i.beforeRows+='<TD colspan="'+i.cols+'" class="'+this.how+'-header">'+i.header+'</TD>'+i.betweenRows;
		i.header='';
	}
	if (i.footer) {
		i.afterRows=i.betweenRows+'<TD colspan="'+i.cols+'" class="'+this.how+'-footer">'+i.footer+'</TD>'+i.afterRows;
		i.footer='';
	}

	var cols=0;var rows=0;
	o.s=i.beforeRows+i.beforeCols;
	for (var j=0;j<i.max&&i.collection[j];j++) {
		if (cols==0&&rows>0) o.s+=i.afterCols+i.betweenRows+i.beforeCols;
		o.s+=this.register(new Compartment({forItem:'['+j+']',id:this.id+'['+j+']',how:i.contentHow,toParent:true}));
		if (++cols==i.cols) {rows++;cols=0} else o.s+=i.betweenCols;
	}
	o.s+=i.afterCols+i.afterRows;
	if (o.s==i.beforeRows+i.beforeCols+i.afterCols+i.afterRows) o.s=i.beforeRows+'<TD colspan="'+i.cols+'" class="'+this.how+'-empty">'+i.empty+'</TD>'+i.afterRows;
	break;
case 'simple-container':
	o=this.callTemplate('container',{
		collection:i,
		max:this.max,
		cols:this.cols,
		contentHow:this.contentHow,
		header:this.header,
		footer:this.footer,
		empty:this.empty
	});
	break;
case 'root':	
	o.s+='<TABLE cellspacing=0 cellpadding=0 class="root">'
	o.s+='<TR><TD>'+this.register(new Compartment({forItem:'root',id:'header',how:'tab-container'}))+'</TD></TR>';
	o.s+='<TR><TD>'+this.register(new Compartment({forItem:'.body',id:'body',how:'body'}))+'</TD></TR>';
	o.s+='<TR><TD id="footer">'+i.footer+'</TD></TR>';
	o.s+='</TABLE>';
	break;
case 'tab-container':
	o=this.callTemplate('container',{
		collection:i,
		contentHow:'tab',
		cols:10,
		beforeCols:'<TD><IMG src="lijn.gif" alt="" width=2 height=2></TD><TD>',
		betweenCols:'</TD><TD><IMG src="lijn.gif" alt="" width=2 height=2></TD><TD>'
	});
	break;
case 'body':
	o.s+='<TABLE cellspacing=2 cellpadding=0 class="body"><TR>';
	o.s+='<TD>'+this.register(new Compartment({forItem:'.sidebars',id:'sidebars',how:'sidebar-container'}))+'"</TD>';
	o.s+='<TD>'+this.register(new Compartment({forItem:'.content',id:'content',how:'content'}))+'"</TD>';
        o.s+='</TR></TABLE>';
	break;
case 'sidebar-container':
	o=this.callTemplate('container',{collection:i,contentHow:'sidebar'});
	break;
case 'sidebar': 
	o=this.callTemplate('container',{
		collection:i,
		max:10,
		header:i.title,
		empty:'&lt; empty &gt;',
		contentHow:'button'
	});
	break;
case 'content': 
	o.s+='<H1>'+i.title+'</H1><P>'+i.subtitle+'</P>';
	o.s+='<TABLE cellspacing=0 cellpadding=0><TR>';
	o.s+='<TD>'+eval(i.text)+'</TD>';
	o.s+='<TD class="note" id="note"><H3>Help</H3><P>'+(i.defaultHelp||'On this side of the page you can find extra information that may help you navigate the site.')+'</P></TD>';
	o.s+='</TR></TABLE>';
	break;
case 'weblog': 
	o.s='<H3>'+this.callTemplate('dateLong',i.date)+'</H3>'+eval(i.text);
	break;
case 'title-date-list':
	o.title='Go to "'+i.title+'"...';
	o.action='w3f_go("'+i.id+'")';
	o.help='Click to view "'+i.title+'".'
	o.s='<UL><LI><B>'+i.title+'</B> ('+this.callTemplate('dateShort',i.date)+')</LI></UL>';
	break;
case 'tab':
	o.action='w3f_go("'+i.id+'")';
	o.title='Go to '+i.title+'...';
	o.s='<NOBR>'+i.title+'</NOBR>';
	break;
case 'button':
	o.s='<NOBR>'+i.title+'</NOBR>';
	break;
case 'dateShort':
	var year=i.getFullYear();
	var month=i.getMonth()+1;
	var day=i.getDate();
	o.s=year+'/'+(month<10?'0':'')+month+'/'+(day<10?'0':'')+day;
	break;
case 'dateLong':
	var m=['January','February','March','April','May','June','Juli','August','September','October','November','December'];
	var d=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var year=i.getFullYear();
	var month=i.getMonth();
	var dt=i.getDate();
	var day=i.getDay();
	o.s=d[day]+', '+m[month]+' '+dt+', '+year;
	break;
default: o.s='ERROR: template not found!';break;
}
		return o;
	}
}

var rootCompartment;
var helpTimeout;

function w3f_onload() {
	top.setValue('root.body.content',top.location.search.substr(1)||top.getValue('root.body.content'));
	rootCompartment=new Compartment({forItem:'root',id:'root',how:'root'});
	rootCompartment.update();
}

function w3f_setHelp(target) {
	if (!target.help) return;
	var note=document.getElementById('note');
	var notePar=note.offsetParent;
	var thisPar=target.offsetParent;
	var thisY=target.offsetTop;
	while (thisPar!=notePar&&thisPar!=document.body) {
		thisY+=thisPar.offsetTop;
		thisPar=thisPar.offsetParent;
	}
	if (thisPar==notePar) thisY-=note.offsetTop+10; else thisY=0;
	if (thisY<0) thisY=0;
	note.style.paddingTop=thisY+'px';
	note.innerHTML='<H3>Help</H3><P>'+target.help+'</P>';
	if (helpTimeout) window.clearTimeout(helpTimeout);
}

function w3f_clearHelp() {
	helpTimeout=window.setTimeout(w3f_setDefaultHelp,2000);
}

function w3f_setDefaultHelp() {
	var note=document.getElementById('note');
	note.style.paddingTop='0px';
	note.innerHTML='<H3>Help</H3><P>'+(top.getObject('root.body.content').defaultHelp||'On this side of the page you can find extra information that may help you navigate the site.')+'</P>';
}

function w3f_go(item) {
	var h=top.getValue('history');
	if (item<0) {
		var back=-item;
		var newLength=h.length-back;
		if (newLength<0) return;
		item=h[back-1].item;
		for (var i=0;i<newLength;i++) h[i]={
			title:h[i+back].title,
			item:h[i+back].item,
			action:'w3f_go(-'+(i+1)+')'
		}
		for (var i=newLength;i<h.length;i++) h[i]=false;
		h.length=newLength;
	} else {
		var olditem=top.getValue('root.body.content');
		if (item==olditem) return;
		if (olditem) {
			h[h.length]={action:'w3f_go(-'+(h.length+1)+')'};
			for (var i=h.length;i>0;i--) {
				h[i].title=h[i-1].title;
				h[i].item=h[i-1].item;
			}
			h[0]={title:top.getObject(olditem).title,action:'w3f_go(-1)',item:olditem};
			h.length=1*h.length+1;
		}
	}
	top.setValue('root.body.content',item);
	rootCompartment.compartments['body'].update();
}

function w3f_viewdata(el) {
	var src=viewdata_object(el);
	src+='<style>BODY {font-family: Tahoma;font-size: 70%;} .e{color:darkred} .i{margin-left:0.2em;border-left:1px dotted #CCCCCC;padding-left:0.7em} .a,.t{font-weight:bold;color:black} .f{color:blue}</style>';
	var w=window.open();
	with (w.document) {open();write(src);close();}
}

function viewdata_object(o) {
	var s='';
	try {
		for (var i in o) {
			if (''+o[i].constructor==''+Object) {
				s+='<div class="e">'+i+'<span class="f">:</span></div><div class="i">';
				s+=viewdata_object(o[i])+'</div>';
			} else s+='<div><span class="e">'+i+'</span><span class="f">:"</span><span class="t">'+(''+o[i]).replace(/</g,'&lt;').substr(0,100)+'</span><span class="f">"</span></div>'
		}
	} catch(e) {s=''+o}
	return s;
}

function w3f_viewsource(el) {
	var src=viewsource_element(el);
	src+='<style>BODY {font-family: Tahoma;font-size: 70%;} .e{color:darkred} .i{margin-left:1em} .a,.t{font-weight:bold;color:black} .f{color:blue}</style>';
	var w=window.open();
	with (w.document) {open();write(src);close();}
}

function viewsource_element(el) {
	var n=el.nodeName.toUpperCase();
	var inline=(n=='A')||(n=='B')||(n=='IMG')||(n=='I')||(n=='EM')||(n=='STRONG')||(n=='NOBR')||(n=='SPAN');
	var s=(inline?'<SPAN class="e">':'<div class="e">');
	s+='<span class="f">&lt;</span>'+n;
	var attrs=['class','id','href','src','title','colspan','rowspan'];
	for (i=0;i<attrs.length;i++) s+=viewsource_attr(el,attrs[i]);
	s+='<span class="f">&gt;</span>';
	s+=(inline?'</span>':'</div>');
	var content='';
	for (var i=0;i<el.childNodes.length;i++) {
		var N=el.childNodes[i];
		switch (N.nodeType) {
			case 1:// element
				content+=viewsource_element(N);
				break;
			case 3:// text
				content+='<span class="t">'+N.nodeValue+'</span>';
				break;
			default: break;
		}
	}
	if (!content&&el.innerText) content='<span class="t">'+el.innerText+'</span>';
	if (content) {
		s+=(inline?content:'<div class="i">'+content+'</div>');
		s+='<span class="e"><span class="f">&lt;/</span>'+n+'<span class="f">&gt;</span></span>'
	}
	return s;
}

function viewsource_attr(el,aName) {
	var a;
	if (el.attributes.getNamedItem) a=el.attributes.getNamedItem(aName);
		else a=el.attributes[aName];
	if (a&&(''+a.nodeValue)!='null') return ' '+a.nodeName+'<span class="f">="</span><span class="a">'+a.nodeValue+'</span><span class="f">"</span>'; else return '';
}