w3f_commentList=[];

function w3f_comments(subject) {
	document.write(
		'H2'.w('Comments')+
		'P'.w(
			'TABLE cellspacing=0 cellpadding=0'.w(
				'TR'.w(
					'TD'.w(
						createButton({style:'buttonflat',content:'<img src="/w3f/plus.png" hspace=2 vspace=2 align="absmiddle">',action:'w3f_startReply(0)'})
					)+
					'TD onclick="w3f_startReply(0)"'.w('Write Comment')
				)
			)
		)+
		'DIV id="commentform" style="display:none"'.w(
			'FORM name="comments" onsubmit="return false"'.w(
				'P'.w(
					'TABLE width="90%"'.w(
						'TR'.w(
							'TD style="vertical-align:middle"'.w('Name:')+
							'TD style="vertical-align:middle" width="100%"'.w('<INPUT name="authorname" size=20 style="width:100%">')+
							'TD style="vertical-align:middle"'.w(
								'TABLE cellspacing=0 cellpadding=0 style="border:1px solid #000040"'.w(
									'TR'.w(
										'TD'.w(
											createButton({style:'button',content:'Post Comment',action:'w3f_addComment()'})
										)
									)
								)
							)
						)+
						'TR'.w(
							'TD style="vertical-align:middle"'.w('E-mail:')+
							'TD style="vertical-align:middle"'.w('<INPUT name="authormail" size=20 style="width:100%">')+
							'TD style="vertical-align:middle"'.w(
								'TABLE cellspacing=0 cellpadding=0 style="border:1px solid #000040" width="100%"'.w(
									'TR'.w(
										'TD'.w(
											createButton({style:'button',content:'Cancel',action:'"commentform".hide()'})
										)
									)
								)
							)
						)+
						'TR'.w(
							'TD style="vertical-align:middle"'.w('Subject:')+
							'TD colspan=2'.w('<INPUT name="subject" size=20 style="width:100%">')
						)+
						'TR'.w(
							'TD colspan=3'.w('<TEXTAREA name="body" cols=20 rows=10 style="width:100%"></TEXTAREA>')
						)
					)+
					'<INPUT type="hidden" name="about">'
				)
			)
		)+
		'<P id="postresult"></P>'+
		'<DIV id="replies'+location+'"></DIV>'
	);
	w3f_commentList[0]={
		uri:location,
		subject:subject,
		body:''
	}
	w3f_getReplies(''+location);
}

function w3f_getReplies(uri) {
	try {
		var service=new w3f_XMLRPCService('http://w3future.com/tools/RPC/');
	} catch(e) {
		setTimeout('w3f_getReplies("'+uri+'")',1000);
		return;
	}
	service.uri=uri;
	service.onload=function() {
		(
			this.error
			||this.result.reduce(function(r,s) {return s+w3f_renderComment(r);})
			||'P'.w('No comments yet.')
		).into('replies'+this.uri);
		initButtons();
	}
	service.call('discuss.getReplies',[uri]);
}

function w3f_renderComment(r) {
	var nr=w3f_commentList.length;
	w3f_commentList[nr]=r;
	var datestr = ''+r.timestamp;
	datestr=datestr.replace(/(\w+)\s+(\w+)\s+(\d+)\s+(\d+)\:(\d+)\:(\d+)\s+\S+\s+(\d+)/,'$1 $2 $3, $7 at $4:$5');
	if (r.replyCount) w3f_getReplies(r.uri);
	return 'BLOCKQUOTE'.w(
		'TABLE cellspacing=0 cellpadding=0 style="border:1px solid #000040" align="right"'.w(
			'TR'.w(
				'TD'.w(
					createButton({style:'button',content:'Reply',action:'w3f_startReply('+nr+')'})
				)
			)
		)+
		'B'.w(r.subject)+'<BR>'+
		'by '+('A href="mailto:'+r.authormail+'"').w(r.authorname)+' on '+datestr
	)+
	'P'.w(r.body.replace(/</g,'&lt;').replace(/\n/g,'<BR>'))+
	'<DIV id="replies'+r.uri+'" style="margin:0em 0em 0em 1em"></DIV>';
}

function w3f_startReply(nr) {
	var f=document.forms["comments"];
	var r=w3f_commentList[nr];
	var s=r.subject;
	if (s.substr(0,3)!='Re:') s='Re: '+s;
	f.subject.value=s;
	f.about.value=r.uri;
	f.body.value=(r.body?r.authorname+' wrote:\n> '+r.body.replace(/\n/g,'\n> ')+'\n':'');
	'commentform'.show();
	''.into('postresult');
}

function w3f_addComment() {
	'<B>Posting comment...</B>'.into('postresult');
	var o={};
	var f=document.forms["comments"];
	for (var i=0;i<f.elements.length;i++) {
		var e=f.elements[i];
		o[e.name]=e.value;
	}
	'commentform'.hide();
	var service=new w3f_XMLRPCService('http://w3future.com/tools/RPC/');
	service.o=o;
	service.onload=function() {
		var o=this.o;
		o.uri=this.result;
		o.timestamp=new Date();
		var div=document.getElementById('replies'+o.about);
		var divh=div.innerHTML;
		if (divh=='<P>No comments yet.</P>') div.innerHTML=w3f_renderComment(o);
			else div.innerHTML+=w3f_renderComment(o);
		(this.error||'B'.w('Comment posted.')).into('postresult');
		initButtons();
	}
	service.call('discuss.addComment',[o]);
}