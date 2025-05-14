var xoomleUrl='';
function doSearch(text) {
  if (!text) {
    text=document.getElementById('url').value;
  } else {
    document.getElementById('url').value=text;
  }
  try {
    location = '#'+text;
  } catch(e) {}
  var s=new w3f_XMLDocument();
  s.onload=function () {
    if (this.documentElement.nodeName=='!error') {
      alert('Error parsing '+this.url+' at line '+this.documentElement.attributes.line+': '+this.documentElement.attributes.code);
      return;
    }
    var result=this.getSimpleTree().GoogleSearchResult;
    var html='';
    try {
    if (result.resultElements) {
      var results=result.resultElements.item;
      var j=0;
      if (result.startIndex>0) {
        for (var i=0;i<=result.endIndex-result.startIndex;i++) {
          try{
            var res=results[i];
            if (!res) continue;
            var url=''+res.URL;
            if (url=='https://w3future.com/weblog/') continue;
            var title=res.title['#text']||url;
            var m=url.match(/(\d{4})\/(\d{2})\/(\d{2})/);
            if (m&&url.indexOf('w3future.com')!=-1) {
              var d=new Date(m[1],m[2]-1,m[3]);
              title=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]+', '+
                ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()]+' '+
                d.getDate()+', '+d.getFullYear();
            }
            html+='<h4><a href="'+url+'">'+title+'</a></h4>';
            if (res.snippet['#text'])
              html+='<blockquote><p>'+res.snippet+'</p></blockquote>';
            html+='<p>'+url+' - <span style="cursor:pointer;cursor:hand;text-decoration:underline" onclick="doSearch(\'link:'+url+'\');" title="Show which sites link to this page">links to this page</span></p>';
          } catch(e) {alert(e.message)}
        }
      }
    }
    } catch(e) {alert(e.message)}
    try {if (result.errorString) html+="<h3>Error: "+result.errorString+"</h3>";} catch(e) {alert(e.message)}
    if (!html) html="<h3>No results found</h3>";
    html+='<p><a href="http://www.google.com/search?q='+escape(text)+'">Same search with Google\'s interface.</a></p>';
    html+='<p><a href="'+xoomleUrl+'"><img src="http://radio.weblogs.com/0100323/images/xml.gif" width="36" height="14" alt="[XML]" /> This result in XML format.</a></p>';
    document.getElementById('OPMLDiv').innerHTML=html;
  };
  document.getElementById('OPMLDiv').innerHTML='Searching...';
  if (text.indexOf('link:')!=0) {
    text+=" site:w3future.com";
    xoomleUrl='http://xoomle.dentedreality.com.au/search/?key=6ycnFAZiVyxI5J5Xu%2B9s6zlKNGx5au02&maxResults=20&filter=0&safeSearch=0&q='+escape(text);
  } else {
    xoomleUrl='http://xoomle.dentedreality.com.au/search/?key=6ycnFAZiVyxI5J5Xu%2B9s6zlKNGx5au02&maxResults=20&filter=1&safeSearch=1&q='+escape(text);
  }
  s.load(xoomleUrl);
}

function fixText(s) {
  return s.replace(/</g,'&lt;');
}

function err(e,s) {
  for (var i in e) {
    s+='\n'+i+': '+e[i];
  }
  alert(s);
}

function loadHash() {
  var h=location.hash;
  if (h.length<2) return;
  h=h.substr(1);
  document.forms['loader'].url.value=h;
  doSearch(h);
}
document.body.setAttribute("onload","loadHash()");
document.body.onload=new Function("", "loadHash()");
