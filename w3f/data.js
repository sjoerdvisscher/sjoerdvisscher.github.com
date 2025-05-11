var data={

root:{
  footer:'&copy; 2000 <A href="mailto:sjoerd@w3future.com">Sjoerd Visscher</A>, w3future.com (<span style="cursor:pointer;cursor:hand;" onclick="w3f_viewsource(document.documentElement)">View Page Source</span>|<span style="cursor:pointer;cursor:hand;" onclick="w3f_viewdata(top.data)">View Page Data</span>)',
  body:{
    sidebars:{
      '0':'tasks',
      '1':'history'
    },
    content:'mainpage'
  },
  '0':'mainpage',
  '1':'articles',
  '2':{title:'Return',subtitle:'',text:"'<H2>Return</H2><P>Click <A href=\"/weblog\" target=_top>here</A>.</P>'",help:'Click to return.'}
},
tasks:{title:'Tasks',
  '0':{title:'Go Back',action:'w3f_go(-1)',help:'Click to go back to the previous page.'},
  '1':{title:'Bookmarkable Address',action:'top.location="index.html?"+top.getValue("root.body.content");',help:'After you click, you can bookmark the page you\'re currently viewing.'},
  '2':{title:'Refresh View',action:'rootCompartment.update()',help:'Click to redraw the page.'},
  '3':{title:'View Source',action:'w3f_viewsource(document.getElementById("content"))',help:'(For advanced users) View the HTML source of the content.'},
  '4':{title:'View Data',action:'w3f_viewdata(top.getObject("root.body.content"))',help:'(For advanced users) View the data structure used for the current page.'}
},
history:{title:'History',length:0},
mainpage:{title:'Main Page',subtitle:'Welcome to w3future.com',help:'Click to visit the main page.',
  text:"'<TABLE cellspacing=0 cellpadding=0 width=\"100%\"><TR><TD COLSPAN=2>'+this.register(new Compartment({forItem:'articles',max:5,id:'articles',how:'simple-container',contentHow:'title-date-list',header:'<H2>Articles</H2>',empty:'<P>No articles yet.</P>'}))+'</TD></TR><TR><TD COLSPAN=2>'+this.register(new Compartment({forItem:'mainpage',id:'weblog',how:'simple-container',contentHow:'weblog',max:5,header:'<H2>News</H2>'}))+'</TD></TR></TABLE>'",
  '0':{date:new Date(2001,0,4),text:"'<P>I added dynamic help to the page. Hover here to test.</P>'",action:'alert("OK, you get it! You passed the w3future.com navigation test! ;-)")',help:'Now you need to click!',title:'Help test.'},
  '1':{date:new Date(2001,0,2),text:"'<P>I changed the layout to be more compatible with Netscape 6. I also added the task Bookmarkable Address, which allows you to bookmark the content that\\'s currently shown. View Source and View Data now look nicer too.</P>'"},  
  '2':{date:new Date(2001,0,1),text:"'<P>I wrote the first article! Read it!</P><P>Other updates: I have made content creation more dynamic. It is now very easy to put a list of items on a page and add new items. I also updated the tasks. With Refresh View you can see how fast the source data (View Data) is transformed into HTML (View Page Source, at the bottom of this page). View Source shows the HTML code for the content section (this white part) only. The footprint? Still below 30K!</P>'"},
  '3':{date:new Date(2000,11,21),text:"'<P>Yes, I know. It\\'s about time... I\\'ve been busy generating all kinds of ideas for this site. Now it\\'s time to get productive. I changed the layout a little, to support the usability ideas I have. I hope I can show you more of that shortly.</P>'"},
  '4':{date:new Date(2000,7,20),text:"'<P>Today I tried to write some client side code, to test some ideas. It worked out pretty well, so I decided to put it online. It\\'s nowhere near feature complete, and only workes on IE5 and Mozilla. I\\'m glad that my ideas seem to be executable. And the bytecount of the whole site is still below 20K! That includes all data and pictures. If you find a bug, please <A href=\"mailto:sjoerd@w3future.com\">contact me</A>.</P><P>The logo is designed by Marco Tibben. We\\'re still fine-tuning it, but it\\'s already pretty cool! Thanks, Marco! He has also recently started a new site, called <A href=\"http://www.maggerydoo.net\">MaGgeryDoO</A>. There they do \"taylormade graphics\", and is definitely worth a visit!</P>'"},
  '5':{date:new Date(2000,5,25),text:"'<P>The birth of w3future.com! I ordered an account at <A href=\"http://cedant.com\">Cedant Web Hosting</A>. There\\'s nothing here yet...</P>'"}
},
articles:{title:'Articles',subtitle:'',help:'Click to visit the articles section.',
  text:"this.register(new Compartment({forItem:'articles',max:10,id:'articles',how:'simple-container',contentHow:'title-date-list',header:'<H2>Latest articles</H2>',empty:'<P>No articles yet.</P>'}))",
  '0':{title:'Happy new year!',subtitle:'Predictions for 2001.',note:'<H3>Note</H3><P>This is my first article! ;-)</P>',date:new Date(2001,0,1),
    text:'"<H3>01/01/01</H3><P>I love this date. The first day of the first month of the first year of this century... No wait, the second year, right? Whatever, at least it is a perfect day for the first article of this site. It is also the day that everybody makes promises and predictions, and as this is a site about the future of the world wide web, I felt I had make that the subject of this article.</P><H3>Promises</H3><P>My promise for me this year to you is: I will certainly make more frequent updates to w3future.com than last year. In fact, I\'ve decided to devote a full 100% of my time to it. The last few days I have been busy on this site and that made me certain it\'s the best job there is. I\'ve promised myself that I know in the coming six months if this really is cool technology or if I should stop dreaming and just find a decent job.</P>'
    +'<H3>Predictions</H3><P>In my opinion last year has been pretty quiet on the web. I mean, sure, there was stuff to do and to read, but there were no killer apps. There\'s nothing I use in my daily surfing today that wasn\'t there a year ago. So I don\'t suspect that there will be cool new websites that everybody will talk about; If there are still cool ideas that work, then we would have seen those last year already.</P><P>However, there has happened quite a bit on the standards side. I think we can expect at least one killer app that makes smart use of SOAP or XML-RPC. Cool stuff with multiple clients and multiple servers. Both Microsoft and Netscape already have crude support for XML over HTTP in their current browsers, and this year\'s versions will be completely SOAP compliant. So RPC calls might unexpectedly show up on your favorite websites.</P>'
    +'<P>But instead of a site it might just as well be a new application that becomes the hot topic. Although more and more users might not be interested anymore in downloading stuff. Broadband and good streaming technology give users instant action expectations. Users will also use more than one computer or other internet enabled devices, which gives server-based applications an advantage. Or download might simply not work, because of security reasons, or because the device is not Wintel compatible.</P><H3>Hot topics</H3><P>Discussion will continue about RDF and Topic Maps. The complexity will be reduced, and cool examples spark the interest of marketing people. Some search-engine will start harvesting RDF data, but won\'t return useful information until next year. XForms and XLink are going to be used in many new research projects. As will XSchema and XSLT.</P>'
    +'<H3>Some last easy ones</H3><P>Microsoft will come up with very cool technology or screw up completely. Or probably both, as always. Netscape won\'t take over the browser-market, but Mozilla will stay an interesting development. The web will become even more popular, and part of our lives, but wireless internet will have to wait another year.</P><P>Sjoerd Visscher"'
  }
}
// end data object
}

function getValue(id) {
	var o;
	try {
		o=eval('data.'+id);
	} catch(e) {
		alert('ERROR: "'+id+'" unknown');
		return false;
	}
	return o;
}

function getObject(id) {
	var o=getValue(id);
	while (o.constructor==String) o=getValue(o);
	return o;
}

function setValue(id,value) {
	try {
		o=eval('data.'+id+'=value');
	} catch(e) {
		alert('ERROR: "'+id+'" unknown');
		return false;
	}
	return value;
}

function setId(o) {
	if (o.constructor==String) return;
	for (var i in o) {o[i].id=o.id+'.'+i;setId(o[i])}
	for (var i=0;o[i];i++) {o[i].id=o.id+'['+i+']';setId(o[i])}
}

for (var i in data) {
	var o=data[i];o.id=i;setId(o);
}