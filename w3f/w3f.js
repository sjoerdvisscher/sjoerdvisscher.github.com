var buttonBag={};
var buttonCnt=0;
var collapserBag={};
var collapserCnt=0;

function createButton(data) {
	data.id='button'+buttonCnt++;
	buttonBag[data.id]=data;
	data.innerHTML='...';
	if (data.go) data.innerHTML='<a href="'+data.go+'"><nobr>'+data.content+'</nobr></a>';
	if (data.gonew) data.innerHTML='<a href="'+data.gonew+'" target="_blank"><nobr>'+data.content+'</nobr></a>';
	if (data.action) data.innerHTML='<nobr>'+data.content+'</nobr>';
	return '<div id="'+data.id+'" class="'+data.style+'">'+data.innerHTML+'</div>';
}

function initButtons(noTables) {
	var tagName=(noTables?'div':'td');
	for (var i in buttonBag) {
		var b=buttonBag[i];
		if (b.done) continue;
		var e=document.getElementById(b.id);
		if (!noTables) {
			e=e.parentNode;
			e.innerHTML=b.innerHTML;
			e.className=b.style;
		}
		e.onmouseover=new Function('','this.className="'+b.style+'-hover"');
		e.onmouseout=new Function('','this.className="'+b.style+'"');
		if (b.go) {
			e.onclick=new Function('evt','if((evt?evt.target:event.srcElement).nodeName.toLowerCase()=="'+tagName+'") location="'+b.go+'";');
			e.title=b.title||"Open "+b.go;
		}
		if (b.gonew) {
			e.onclick=new Function('evt','if((evt?evt.target:event.srcElement).nodeName.toLowerCase()=="'+tagName+'") window.open("'+b.gonew+'");');
			e.title=b.title||"Open "+b.gonew+" in new window.";
		}
		if (b.action) {
			e.onclick=new Function('',b.action);
		}
		b.done=true;
	}
}

var buttonFromLinkCount=0;
function initButtonFromLink(elt) {
	var id=elt.id||(elt.id='buttonFromLink'+buttonFromLinkCount);
	var className=elt.className;
	var a=elt.firstChild;
	elt.onmouseover=new Function('','this.className="'+className+'-hover"');
	elt.onmouseout=new Function('','this.className="'+className+'"');
	if (a.target) {
		elt.onclick=new Function('evt','if((evt?evt.target:event.srcElement).id=="'+id+'") window.open("'+a.href+'");');
		elt.title=elt.title||"Open "+a.href+" in new window.";
	} else {
		elt.onclick=new Function('evt','if((evt?evt.target:event.srcElement).id=="'+id+'") location="'+a.href+'";');
		elt.title=elt.title||"Open "+a.href;
	}
	buttonFromLinkCount++;
}
/*
function createCollapser(data) {
	var i=collapserCnt++;
	data.id=data.id||'collapser'+i;
	
		'P'.w(
			'TABLE cellspacing=0 cellpadding=0'.w(
				'TR'.w(
					'TD'.w(
						createButton({style:'buttonflat',content:'<img src="/w3f/plus.png" hspace=2 vspace=2 align="absmiddle">',action:'w3f_startReply(0)'})
					)+
					'TD onclick="w3f_startReply(0)"'.w()
				)
			)
		)+

}
*/

function createSectionButtons() {
	document.write('<td>'+createButton({style:'tab',content:'Weblog',go:'http://w3future.com/weblog'})+'</td>');
	document.write('<td>&nbsp;</td><td>'+createButton({style:'tab',content:'Examples',go:'http://w3future.com/html/tools.html'})+'</td>');
	document.write('<td>&nbsp;</td><td>'+createButton({style:'tab',content:'Articles',go:'http://w3future.com/html/stories/'})+'</td>');
	document.write('<td>&nbsp;</td><td>'+createButton({style:'tab',content:'Downloads',go:'http://w3future.com/html/download.html'})+'</td>');
}

function createSectionButtonsTable() {
	document.write('<table cellspacing="0" cellpadding="0"><tr>');
	createSectionButtons();
	document.write('</tr></table>');
}

function createSectionButtonsDivs() {
	document.write(createButton({style:'tab',content:'Weblog',go:'http://w3future.com/weblog'}));
	document.write(createButton({style:'tab',content:'Examples',go:'http://w3future.com/html/tools.html'}));
	document.write(createButton({style:'tab',content:'Articles',go:'http://w3future.com/html/stories/'}));
	document.write(createButton({style:'tab',content:'Downloads',go:'http://w3future.com/html/download.html'}));
}

function createWeblogSidebar() {
	var w=function(s) {document.write(s)};
	w('<table cellpadding=0 cellspacing=0 class="sidebar-container" width="100%"><tr><td>');
	for (var sb in weblogSidebar) {
		var items=weblogSidebar[sb];
		w('<table cellpadding=0 cellspacing=0 class="sidebar" width="100%">');
		w('<tr><td class="sidebar-header">'+sb+'</td></tr>');
		for (var i=0;i<items.length;i++)
			w('<tr><td>'+createButton(items[i])+'</td></tr>');
		w('</table>');
	}
	w('</td></tr></table>');
}

function createWeblogSidebarDivs() {
	var w=function(s) {document.write(s)};
	for (var sb in weblogSidebar) {
		var items=weblogSidebar[sb];
		w('<div class="sidebar-header">'+sb+'</div>');
		for (var i=0;i<items.length;i++)
			w(createButton(items[i]));
	}
}

var weblogSidebar={
	'What I read':[
		{style:'button2',content:'Jake\'s Brainpan',gonew:'http://jake.editthispage.com/'},
		{style:'button2',content:'Joel on Software',gonew:'http://joel.editthispage.com/'},
		{style:'button2',content:'Lambda the Ultimate',gonew:'http://lambda.weblogs.com/'},
		{style:'button2',content:'markpasc.blog',gonew:'http://markpasc.org/blog/'},
		{style:'button2',content:'owrede_log',gonew:'http://owrede.khm.de/'},
		{style:'button2',content:'Scripting News',gonew:'http://www.scripting.com'},
		{style:'button2',content:'XMLHack',gonew:'http://www.xmlhack.com/'},
		{style:'button2',content:'<B>All sources</B>',go:'http://w3future.com/html/weblogsources.html'}
	],
	'Friends/Family':[
		{style:'button2',content:'Joeri',gonew:'http://joeri.mulder.com'},
		{style:'button2',content:'Marco',gonew:'http://www.maggerydoo.net'},
		{style:'button2',content:'Jelle',gonew:'http://uitdeschaduw.blogspot.com'},
		{style:'button2',content:'Q42',gonew:'http://www.q42.nl'}
	]
}

function staticSiteStatsImage() {
	var imageUrl = "http://referers.userland.com/staticSiteStats/count.gif";
	var imageTag = "<img src=\"" + imageUrl + "?group=radio1&usernum=100323&referer=" + escape (document.referrer) + "\" height=\"1\" width=\"1\">";
	document.write (imageTag);
}

function initSectionTabs() {
	var tabs=document.getElementById('header-tabs').getElementsByTagName('div');
	var l=tabs.length;
	for (var i=0;i<l;i++)
		initButtonFromLink(tabs[i]);
}

function initSidebarButtons() {
	var tabs=document.getElementById('sidebar').getElementsByTagName('div');
	var l=tabs.length;
	for (var i=0;i<l;i++)
		if (tabs[i].className=='button2')
			initButtonFromLink(tabs[i]);
}