var n=navigator.appName;
var v=navigator.appVersion
var versie;
var isNav = (n == "Netscape") ? true : false;
var isIE = (n.indexOf("Microsoft") != -1) ? true : false;
if (isIE) versie=parseInt(v.charAt(v.indexOf('MSIE')+5));
	else versie=parseInt(v.charAt(0));
var isIE4 = (isIE&&versie>=4)
var isIE5 = (isIE&&versie>=5)
var imgFX = false;
var sInitialSRC;
var sFinalSRC;
if (document.images) {imgFX = true;if (isNav&&versie==2) {imgFX = false;}}
if (top.frames.length != 0)
{
  top.location="/index.html?pagina="+escape((''+location).substr(16));
}
window.status='W3revolution';

function getItem(id) {
  if (document.getElementById) return document.getElementById(id);
  else return document.all.item(id);
}

function getTags(el,tagname) {
  if (el.getElementsByTagName) return el.getElementsByTagName(tagname);
  else return el.all.tags(tagname);
}

function doShowHide(i) {
	var l=getTags(getItem('menu'),'TABLE');
	var hs=l[i*2+1];
	var p=getTags(l[i*2],'IMG')[0];
	if (p.src.indexOf('arrowhori.gif')!=-1) {
		hs.style.display='block';
		p.src='arrowverti.gif';
	} else {
		hs.style.display='none';
		p.src='arrowhori.gif';
	}
}
