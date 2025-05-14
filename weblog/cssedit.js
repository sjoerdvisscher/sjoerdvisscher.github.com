var hex="0123456789abcdef";
//document.styleSheets[0].imports[0].href="https://w3future.com/w3f/w3f.phtml?colors=c0ff40,4040a0,176,128,128,32,128,32,96,214,64,128,256,128,192"
var i, colorQS;
var derived={
	'#ecffc4':{f:lighten, c:'#c0ff40', v:176},
	'#f6ffe2':{f:lighten, c:'#ecffc4', v:128},
	'#fbfff1':{f:lighten, c:'#f6ffe2', v:128},
	'#ccdfa4':{f:darken,  c:'#ecffc4', v:32},
	'#6c7f44':{f:darken,  c:'#ecffc4', v:128},
	'#a0df20':{f:darken,  c:'#c0ff40', v:32},
	'#000040':{f:darken,  c:'#4040a0', v:96},
	'#e0e0f0':{f:lighten, c:'#4040a0', v:213},
	'#e8e8f4':{f:lighten, c:'#e0e0f0', v:64},
	'#f0f0f8':{f:lighten, c:'#e0e0f0', v:128},
	'#ffffff':{f:lighten, c:'#f0f0f8', v:256},
	'#f8f8fc':{f:lighten, c:'#f0f0f8', v:132},
	'#fefeff':{f:lighten, c:'#f8f8fc', v:256}
};
var colors={}, rules;
function start() {
rules=document.styleSheets[0].imports[0].rules;
for (i=0;i<rules.length;i++) {
	var a=rules[i].style;
	add('backgroundColor');
	add('color');
	add('borderTopColor');
	add('borderLeftColor');
	add('borderRightColor');
	add('borderBottomColor');
}
for (var c in colors) {
	var editable=!derived[c];
	var id=c.substr(1);
	var s='<p><input style="width:74px" id="inp'+id+'" onchange="set(\''+c+'\', this.value);derive()" value="'+c+'"'+(editable?'':' readonly disabled')+' />';
	s+='<span id="'+id+'" style="background:'+c+'" onclick="'+(editable?'setRGB':'setVal')+'(this);derive()"><img src="../w3f/lijn.gif" width="148" height="30" align="absmiddle"></span></p>';
	colors[c].html=s;
	colors[c].cssRGB=c;
}
function row(txt) {return '<h2>'+txt+'</h2>';}
function h(clr) {try{return colors['#'+clr].html;}catch(e){alert(clr)}}
var s='<div style="float:left;width:250px;padding:0em 2.5em">'+row('Color 1 (Top Background)')+h('c0ff40');
s+=row('Button')+h('ecffc4')+h('f6ffe2')+h('fbfff1')+h('ccdfa4');
s+=row('Visited Link')+h('6c7f44')+row('Title shadow')+h('a0df20');
s+='</div><div style="float:left;width:250px;padding:0em 2.5em">'+row('Color 2 (Link)')+h('4040a0');
s+=row('Hovered Button')+h('f0f0f8')+h('f8f8fc')+h('fefeff')+h('e0e0f0');
s+=row('Text')+h('000040')+row('Text Backgrounds')+h('e8e8f4')+h('ffffff');
s+='</div>';
targetDiv.innerHTML=s;
}
function derive() {
	colorQS=colors['#c0ff40'].cssRGB.substr(1);
	colorQS+=','+colors['#4040a0'].cssRGB.substr(1);
	for (var c in derived) {
		var o=derived[c];
		set(c, o.f(o.c, o.v));
		colorQS+=','+o.v;
	}
	colorLink.value='htt'+'p:/'+'/w3future.com/weblogs/cssedit.html?'+colorQS;
}
function lighten(orig, amount) {
	var realc=colors[orig].rgb;
	var c={
		r:Math.floor(realc.r+(256-realc.r)*amount/256),
		g:Math.floor(realc.g+(256-realc.g)*amount/256),
		b:Math.floor(realc.b+(256-realc.b)*amount/256)
	}
	return toRGB(c);
}
function darken(orig, amount) {
	var realc=colors[orig].rgb;
	var c={
		r:realc.r-amount,
		g:realc.g-amount,
		b:realc.b-amount
	}
	return toRGB(c);
}
function toHex(i) {
	if (i>255) i=255; else if (i<0) i=0;
	return hex.charAt(i>>4)+hex.charAt(i&15);
}
function fromHex(s) {
	return hex.indexOf(s.charAt(0))*16+hex.indexOf(s.charAt(1));
}
function fromRGB(s) {
	s=s.toLowerCase();
	return {
		r:fromHex(s.substr(1,2)),
		g:fromHex(s.substr(3,2)),
		b:fromHex(s.substr(5,2))
	}
}
function toRGB(rgb) {
	return '#'+toHex(rgb.r)+toHex(rgb.g)+toHex(rgb.b)
}
function add(propName) {
	var val=rules[i].style[propName];
	if (!val) return;
	if (!colors[val]) {
		colors[val]=[];
		colors[val].rgb=fromRGB(val);
	}
	colors[val][colors[val].length]={i:i, propName: propName};
}
function set(fromC, toC) {
	var cs=colors[fromC];
	if (toC==cs.cssRGB) return;
	cs.cssRGB=toC;
	cs.rgb=fromRGB(toC);
	for (var o=0;o<cs.length;o++) {
		rules[cs[o].i].style[cs[o].propName]=toC;
	}
	document.getElementById(fromC.substr(1)).style.background=toC;
	document.getElementById('inp'+fromC.substr(1)).value=toC;
}
function setRGB(elt) {
	var fromC='#'+elt.id;
	var rgb=colors[fromC].rgb;
	var val=2*(event.x-elt.getBoundingClientRect().left)-20;
	if (val<0) val=0; else if (val>255) val=255;
	switch((''+(10+event.y-elt.getBoundingClientRect().top)).charAt(0)) {
		case '1': rgb.r=val; pos(elt, val, 0); break;
		case '2': rgb.g=val; pos(elt, val, 10); break;
		case '3': rgb.b=val; pos(elt, val, 20); break;
	}
	var toC=toRGB(rgb);
	set(fromC, toC);
}
function setVal(elt) {
	var fromC='#'+elt.id;
	var val=2*(event.x-elt.getBoundingClientRect().left)-20;
	if (val<0) val=0; else if (val>256) val=256;
	pos(elt, val, 10);
	if (derived[fromC].f==lighten)
		derived[fromC].v=val;
	else derived[fromC].v=256-val;
}
function pos(elt, val, y) {
	var id=elt.id+y;
	var p=document.getElementById(id)||create(id);
	p.style.top=(elt.getBoundingClientRect().top+y+document.body.scrollTop)+'px';
	p.style.left=(elt.getBoundingClientRect().left+(val>>1)+8+document.body.scrollLeft)+'px';
}
function create(id) {
	var e=document.createElement('DIV');
	e.id=id;
	e.style.position='absolute';
	e.style.zIndex='3';
	e.innerHTML='<img src="../w3f/lijn.gif" width=1 height=10 style="background:black;position:absolute;top:0px;left;0px"><img src="../w3f/lijn.gif" width=1 height=10 style="background:white;position:absolute;top:0px;left:1px">';
	document.body.appendChild(e);
	return e;
}
/*window.onload=function() {
	start();
	var init;
	if (location.search) {
		init=location.search.substr(1);
	} else {
		var c=''+document.cookie;
		var m=c.match(/colors\=([a-fA-F0-9\,]+)/);
		if (m&&m[1]) init=m[1];
		else init='ff9900,000033,176,128,128,32,128,32,0,213,0,128,40,128,256';
	}
	init=init.split(',');
	set('#c0ff40','#'+init[0]);
	set('#4040a0','#'+init[1]);
	var i=2;
	for (var c in derived) {
		derived[c].v=1*init[i++];
	}
	derive();
	for (var c in colors) {
		var id=c.substr(1);
		var elt=document.getElementById(id);
		if (derived[c]) {
			pos(elt, derived[c].v, 10);
		} else {
			pos(elt, colors[c].rgb.r, 0);
			pos(elt, colors[c].rgb.g, 10);
			pos(elt, colors[c].rgb.b, 20);
		}
	}
	setTimeout("fade()", 50);
}*/
function fade() {
	layout.filters[1].apply();
	header.filters[1].apply();
	layout.filters[0].enabled=false;
	header.filters[0].enabled=false;
	layout.filters[1].play();
	header.filters[1].play();
}
function setCookie() {
	date=new Date(2010, 1, 1);
	document.cookie="colors="+colorQS+";expires=" + date.toGMTString()+';path=/';
}
function removeCookie() {
	date=new Date(1999, 1, 1);
	document.cookie="colors=;expires=" + date.toGMTString()+';path=/';
}
function postPalette() {
	if (palette.paltitle.value==""||palette.paldetails.value=="") {
		alert("Please give your palette a nice name and at least mention the colors in the details.");
		return;
	}
	var service=new w3f_XMLRPCService('htt'+'p:/'+'/213.84.155.207:5335/RPC2');
	service.onload=function() {
		alert(this.error||this.result);
	}
	service.call('radio.addPalette',[
		palette.paltitle.value,
		palette.paldetails.value,
		colorQS
	]);
}
var moz = document.all?false:true;
var sliders = {};
function initSlider(id)
{
	var input = document.getElementById(id+"-input");
	var rgbEl = document.getElementById(id+"-rgb");
	var el = document.getElementById(id);
	var o=new Color();
	o.input=input;
	o.rgbEl=rgbEl;
	o.el=el;
	o.handle = function(){}

	input.style.width = '6em';
	input.style.textAlign = 'center';
	if (moz)
	  input.style.MozOpacity = '70%';
	else
	  input.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity=70)';
	rgbEl.style.width = '255px';
	rgbEl.style.padding = '1px';
	rgbEl.style.textAlign = 'center';

	o.colorSquare = new ColorSquare();
	o.colorSquare.handle = function(abh) {
    abh.i = 1;
    abh.absi2rgb();
    o.intenSlider.setTo(abh);
    o.A = abh.A;
    o.B = abh.B;
    o.s = abh.s;
    calcColor(o);
    setCursors(o);
	}
	el.appendChild(o.colorSquare.el);

	o.intenSlider = new ColorSlider(new Color('#000000'), new Color('#ffffff'));
	o.intenSlider.handle = function(color, factor) {
    o.colorSquare.setIntensity(factor);
    o.i = factor;
    calcColor(o);
    setCursors(o);
	};
	el.appendChild(o.intenSlider.el);

	sliders[id] = o;
	o.s = o.i = 1;
	o.A = o.B = 0;
	calcColor(o);
	setCursors(o);
	return o;
}
min=Math.min; max=Math.max; abs=Math.abs;
function ab2abs(a,b) {
  var c=new Color();
  var rad = max(abs(a),abs(b));
  if (rad>0) {a/=rad;b/=rad};
  c.s=1-rad*rad;
  c.A=a;
  c.B=b;
  return c;
}
function setCursors(o) {
  o.rgb2absi();
  var rad = Math.sqrt(1-o.s);
  o.colorSquare.setAB(o.A*rad, o.B*rad);
  o.handle(o);
}
function setRGB(id) {
	var o = sliders[id];
	o.setHex(o.input.value);
	setCursors(o);
  o.intenSlider.setFactor(o.i);
}
function calcColor(o) {
	o.absi2rgb();
	o.input.value = o;
	o.rgbEl.style.backgroundColor = o;
}
function ColorSquare()
{
  this.el = document.createElement('div');
  this.el.style.backgroundColor = '#000000';
  this.el.style.width = '257px';
  this.el.style.height = '257px';
  this.el.style.position = 'relative';
  this.el.title="Shift: lock Hue, Ctrl: lock Saturation";

  var me = this;
  this.doMouseMove = function(evt)
  {
    var x; var y;
    evt = evt || event;
    x = evt.clientX - me.el.offsetLeft - 128;
    y = evt.clientY - me.el.offsetTop - 128;
    if (x<-128) x=-128;
    if (x>+128) x=+128;
    if (y<-128) y=-128;
    if (y>+128) y=+128;
    var hs = ab2abs(y/128, x/128);
    if (evt.shiftKey) {hs.A = me.A; hs.B = me.B} else {me.A = hs.A; me.B = hs.B};
    if (evt.ctrlKey) hs.s = me.s; else me.s = hs.s;
    me.handle(hs);
  };
  this.el.onmousedown = function(evt)
  {
    doMouseMove = me.doMouseMove;
    me.doMouseMove(evt);
  };

	var img = this.el.appendChild(document.createElement('div'));
	img.style.background = 'url(rgb.png)';
	img.style.width = '257px';
	img.style.height = '257px';
	img.style.position = 'absolute';
	img.style.zIndex = '1';
	var cursor = this.el.appendChild(document.createElement('div'));
	cursor.style.background = 'url(pointer.png)';
	cursor.style.width = '7px';
	cursor.style.height = '7px';
	cursor.style.position = 'absolute';
	cursor.style.fontSize = '2px';
	cursor.style.top = '-3px';
	cursor.style.left = '-3px';
	cursor.style.cursor = 'default';
	cursor.style.zIndex = '10';
	this.cursor = cursor;
}
ColorSquare.prototype = {
  setAB: function(a,b)
  {
    this.cursor.style.top = (128*a+128-3)+'px';
    this.cursor.style.left = (128*b+128-3)+'px';
  },
  setIntensity: function(i)
  {
    this.el.firstChild.style.MozOpacity = (i*100)+'%';
    if (moz)
      this.el.firstChild.style.MozOpacity = (i*100)+'%';
    else
      this.el.firstChild.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity='+(i*100)+')';
  }
}
function ColorSlider(fromColor, toColor, leftFactor)
{
  this.fromColor = fromColor;
  this.toColor = toColor;
  this.leftFactor = leftFactor||0;
  this.handle = function(){};

  this.el = document.createElement('div');
  this.el.style.width = '257px';
  this.el.style.height = '20px';
  this.el.style.margin = '5px 0px';
  this.el.style.position = 'relative';
  //this.el.unselectable = true;

  this.grad = this.createBlock(0, 0, 201, 20, toColor);
  if (moz)
    for (var j=0;j<=200;j++)
    {
      var div = this.createBlock(j, 0, 1, 20, fromColor, this.grad);
      div.style.MozOpacity = ((1-this.leftFactor+(this.leftFactor*2-1)*j/200)*100)+'%';
    }
  else
  {
    var div = this.createBlock(0, 0, 201, 20, fromColor);
    div.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity='+(100*(1-this.leftFactor))+', FinishOpacity='+(100*this.leftFactor)+', Style=1, StartX=0, StartY=0, FinishX=100, FinishY=0)';
  }

  this.result = this.createBlock(207, 0, 48, 18, fromColor);
  this.result.style.border = '1px solid black';

  var cursor = this.createBlock(-3, -2, 7, 24, 'url(hpointer.png)');
  cursor.style.fontSize = '20px';
  cursor.style.lineHeight = '18px';
  this.cursor = cursor;

  var me = this;
  this.doMouseMove = function(evt)
  {
    evt = evt || event;
    x = evt.clientX - me.el.offsetLeft;
    window.status = x;
    var i = x/201;
    if (i<0) i=0;
    if (i>1) i=1;
    me.setFactor(i);
  };
  this.el.onmousedown = function(evt)
  {
    evt = evt || event;
    x = evt.clientX - me.el.offsetLeft;
    if (x>201) return;
    doMouseMove = me.doMouseMove;
    me.doMouseMove(evt);
  };
}
ColorSlider.prototype = {
  createBlock: function(x, y, w, h, b, parent)
  {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = x+'px';
    div.style.top = y+'px';
    div.style.width = w+'px';
    div.style.height = h+'px';
    div.style.background = b;
    div.style.cursor = 'default';
    div.unselectable = true;
    return (parent||this.el).appendChild(div);
  },
  setTo: function(c)
  {
    this.grad.style.background = c;
    this.toColor = c;
    this.calcColor();
  },
  setFactor: function(f)
  {
    this.cursor.style.left = (f*200-3)+'px';
    this.factor = f;
    this.calcColor();
  },
  calcColor: function()
  {
    this.color = this.leftFactor==0?this.toColor.mix(this.factor, this.fromColor)
      :this.fromColor.mix(this.factor, this.toColor);
    this.result.style.background = this.color;
    this.result.title = this.color;
    this.result.style.borderColor = this.color.mix(0.5, new Color('#000000'));
    this.handle(this.color, this.factor);
  }
}
function Color(hex)
{
	if (hex) this.setHex(hex);
}
Color.prototype = {
  setHex: function(s)
  {
    s=s.toLowerCase();
    this.r = fromHex(s.substr(1,2));
    this.g = fromHex(s.substr(3,2));
    this.b = fromHex(s.substr(5,2));
  },
  mix: function(factor, color)
  {
    var c = new Color();
    c.r = this.r*factor + color.r*(1-factor);
    c.g = this.g*factor + color.g*(1-factor);
    c.b = this.b*factor + color.b*(1-factor);
    return c;
  },
  absi2rgb: function()
  {
    var R=0;var G=0;var B=0;

    if (this.A==1)
    {
      G = min(1, 1-this.B);
      B = min(1, 1+this.B);
    }
    else if (this.B==1)
    {
      R = min(1, 1-this.A);
      B = min(1, 1+this.A);
    }
    else
    {
      R = (1-this.A)/2;
      G = (1-this.B)/2;
    }

    var s=this.s*255;
    this.r = this.i*(s+R*(255-s));
    this.g = this.i*(s+G*(255-s));
    this.b = this.i*(s+B*(255-s));
  },
  rgb2absi: function()
  {
    var r=this.r; var g=this.g; var b=this.b;
    this.i = max(r, g, b);
    if (this.i) {
      r /= this.i; g /= this.i; b /= this.i;
      this.i /= 255;
      this.s = min(r, g, b);
      if (this.s!=1) {
      	r = (r - this.s) / (1 - this.s);
      	g = (g - this.s) / (1 - this.s);
      	b = (b - this.s) / (1 - this.s);
      	if (r == 0) {this.A = 1; this.B = b - g;}
      	else if (g == 0) {this.A = b - r; this.B = 1;}
      	else {this.A = 1 - 2*r; this.B = 1 - 2*g;}
      }
    }
  },
  toString: function()
  {
    return '#'+toHex(this.r)+toHex(this.g)+toHex(this.b);
  }
}
doMouseMove = function() {};
document.body.onmousemove = function(evt) {doMouseMove(evt)};
document.body.onmouseup = function() {doMouseMove = function() {}};
