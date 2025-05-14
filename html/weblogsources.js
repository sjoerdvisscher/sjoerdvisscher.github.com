function compare(a,b) {
	if (a<b) return -1; else if (a==b) return 0; else return 1;
}

function renderSubs(response) {
	if (response.error) {
		'p'.w(
			'There was an error loading my subscriptions:<BR>'+
			response.error
		).into('subscriptions');
		return;
	}
	var subs=w3f_listToArray(response.getSimpleTree().body.outline).sort(function(a,b) {
		return compare(a.title.toLowerCase(),b.title.toLowerCase());
	});
	subs.reduce(function(l,s) {
		var url=l.htmlUrl;
		if (url.length>80) url=url.substr(0,78)+'...';
		s+=
			'h2'.w(l.title)+
			'p'.w(('a href="http://127.0.0.1:5335/system/pages/subscriptions?url='+escape(l.xmlUrl)+'"').w('<img src="http://radio.weblogs.com/0100323/images/xmlCoffeeCup.gif" height="36" width="36" alt="Subscribe (for Radio Userland)" border="0" align="left" style="margin: 1px 0.5em" />')+
				l.description)+
			'p style="clear:left"'.w(
				('a href="'+l.xmlUrl+'"').w('<img src="http://scripting.com/images/xml.gif" height="14" width="36" alt="" border="0" align="left" style="margin: 1px 0.5em" />')+
				'Url: '+('a href="'+l.htmlUrl+'"').w(url));
		return s.replace(/\&amp\;(\w+)\;/g,'&$1;').replace(/\&apos\;/g,"'");
	}).into('subscriptions');
}

initButtons();
var doc=new w3f_XMLDocument();
doc.onload=function() {
	renderSubs(this);
}

doc.load('https://w3future.com/weblog/gems/mySubscriptions.opml');
