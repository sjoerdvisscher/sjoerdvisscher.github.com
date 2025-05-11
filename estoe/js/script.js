var details,
    help,
    canvas,
    defaultHelp = "Hover over a particle to see its details.",
    quarkNames = [["up", "charm", "top"],["down", "strange", "bottom"]],
    leptonNames = ["electron", "muon", "tau"],
    allParticles = {},
    projSelect,
    projections = {},
    projectionAnims = [],
    animStart,
    projection,
    projInputs,
    projInputScale = 40,
    projInputCenter = 55,
    userProj,
    buttonDown = false,
    CIRCLE = "\u25CF",
    SQUARE = "\u25A0",
    DIAMOND = "\u25C6",
    UP_TRIANGLE = "\u25B2",
    DOWN_TRIANGLE = "\u25BC";

function pn(v)
{
  return { pn: v }
}

function all(arrs)
{
  var newArrs = [];
  for (var i = 0; i < arrs.length; i++)
    newArrs = newArrs.concat(all1(arrs[i]));
  return newArrs;
}

function all1(arr)
{
  for (var i = 0; i < arr.length; i++)
    if (arr[i].pn)
    {
      var arr1 = arr.concat([]); arr1[i] =  arr[i].pn;
      var arr2 = arr.concat([]); arr2[i] = -arr[i].pn;
      return all([arr1, arr2]);
    }
  return [arr];
}

function perm(a)
{
  if (a.length == 1)
    return [a];
  var perms = perm(a.slice(1));
  var r = [];
  for (var i = 0; i < perms.length; i++)
  {
    var p = perms[i];
    for (var j = 0; j <= p.length; j++)
      r.push(p.slice(0, j).concat([a[0]]).concat(p.slice(j)));
  }
  r.sort();
  for (var i = r.length - 1; i > 0; i--)
    if (r[i] + "" == r[i - 1] + "")
      r.splice(i, 1);
  return r;
}

function pp(x)
{
  if (x < 0)   return '-' + pp(-x)
  if (x >= 1)  return (x - x % 1) + (x % 1 ? pp(x % 1) : '')
  x *= 6
  if (x < 0.5) return '0'
  if (x < 1.5) return '\u2159'
  if (x < 2.5) return '\u2153'
  if (x < 3.5) return '\u00BD'
  if (x < 4.5) return '\u2154'
  if (x < 5.5) return '\u215A'
}

function addProjection(name, qx, qy)
{
  this.projections[name] = { 
    x: qNums2coords(qx), 
    y: qNums2coords(qy), 
    qx: qx, 
    qy: qy 
  };
  projSelect.options.add(new Option(name, name));
  calcProj(name);
}

function getProjection(name)
{
  return this.projections[name]
}

function addAnim(name)
{
  projSelect.value = name;
  if (projectionAnims.length < 2)
    animStart = new Date;
  projectionAnims.push(name);
}

function projSelectOnchange()
{
  addAnim(projSelect.value);
}

function initProj()
{
  var r   = Math.sqrt(5) - 1,
      zy  = r - 1,
      xyy = r * Math.cos(Math.PI / 15 * 1) - 1,
      xyx = r * Math.sin(Math.PI / 15 * 1),
      uvy = r * Math.cos(Math.PI / 15 * 2) - 1,
      uvx = r * Math.sin(Math.PI / 15 * 2),
      wx  = r * Math.sin(Math.PI / 15 * 3),
      tx  = 2*uvx * Math.sin(Math.PI / 15 / 2);

  this.addProjection(
    'E8',
    coords2qNums([0, tx, -uvx, uvx, -wx, xyx, -xyx,  0]),
    coords2qNums([1,  0,  uvy, uvy,   0, xyy,  xyy, zy])
  )

  this.addProjection(
    'F4',
    [0.36, 0.36,1,0,0,0,0,0],
    [0.36,-0.36,0,1,0,0,0,0]
  )

  this.addProjection(
    'G2',
    [0,0,0,0,0,0,1,0],
    [0,0,0,0,0,0,0,1]
  )

  this.addProjection(
    'Triality',
    [0,0,0,0,1,0,0,0],
    [0,0,0,0,0,1,0,0]
  )

  this.addProjection(
    'F4 toward G2',
    [0.36, 0.36,1,0,0,0,0.1,0  ],
    [0.36,-0.36,0,1,0,0,0  ,0.1]
  )

  this.addProjection(
    'G2 toward F4',
    [0.11, 0.11,0.3,0  ,0,0,1,0],
    [0.11,-0.11,0  ,0.3,0,0,0,1]
  )

  this.addProjection(
    'Overview',
    [0.05, 0.05,0.14,0   ,1.2,0  ,0.22,0   ],
    [0.05,-0.05,0   ,0.14,0  ,1.2,0   ,0.22]
  )

  this.addProjection(
    'Zero',
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]
  )
  
  this.addProjection(
    'User',
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0]
  )
}

function calcProj(name)
{
  var projection = this.getProjection(name)
  for (var vector in allParticles)
  {
    var o = allParticles[vector]
    var x = 0,
        y = 0
    for (var i = 0; i < 8; i++)
    {
      x += projection.x[i] * o.v[i]
      y += projection.y[i] * o.v[i]
    }
    o.x[name] =  x * 180
    o.y[name] = -y * 180
  }
}

function E8Thing()
{
  
  /**
   * @param (Array) vector
   * @return (Boolean)
   * @static
   */
  this.isFermion = function(vector)
  {
    return !this.isBoson(vector)
  }
  
  /**
   * @param (Array) vector
   * @return (Boolean)
   * @static
   */
  this.isBoson = function(v)
  {
    return (v[0] == 0 && v[1] == 0 && v[2] == 0 && v[3] == 0)
        || (v[4] == 0 && v[5] == 0 && v[6] == 0 && v[7] == 0)
  }
  
  /**
   * @param (Array) vector
   * @return Object { left: int, right: int }
   * @static
   */
  this.getGravitationalSpin = function(v)
  {
    return {
      left:  (v[1] + v[0]) / 2,
      right: (v[1] - v[0]) / 2
    }
  }
  
  /**
   * @param (Array) vector
   * @return Object { left: int, right: int }
   * @static
   */
  this.getWeakIsoSpin = function(v)
  {
    return {
      left:  (v[3] + v[2]) / 2,
      right: (v[3] - v[2]) / 2
    }
  }
  
  this.isQuark = function()
  {
    
  }
  
  this.isLepton = function()
  {
    return !this.isQuark()
  }
  
  this.isAntiMatter = function()
  {
    
  }
  
  this.isNeutrino = function()
  {
    
  }
  
  this.initParticles = function()
  {
    var even2h  = [[0.5,  0.5], [-0.5, -0.5]],
        odd2h   = [[0.5, -0.5], [-0.5,  0.5]],
        even4h  = even2h.times(even2h).concat(odd2h.times(odd2h)),
        odd4h   = even2h.times(odd2h).concat(odd2h.times(even2h)),
        even8h  = even4h.times(even4h).concat(odd4h.times(odd4h));

    var vectors = all(even8h.concat(perm([pn(1), pn(1), 0, 0, 0, 0, 0, 0])));
    for (var i = 0; i < vectors.length; i++)
    {
      var v = vectors[i];
      var vector = v;
      var o = allParticles[v] = { v: v, x: {}, y: {} };

      var isBoson   = this.isBoson(vector)
      var isFermion = !isBoson;

      var gravSpin    = this.getGravitationalSpin(vector)
      var weakIsoSpin = this.getWeakIsoSpin(vector)
      var w = v[4];
      var isRed   = v[5] != v[6] && v[5] != v[7];
      var isGreen = v[5] != v[6] && v[6] != v[7];
      var isBlue  = v[7] != v[6] && v[5] != v[7];
      var B2 = -(v[5] + v[6] + v[7]) / 3;

      var generation = 0;
      switch (w / B2)
      {
        case  3: generation = 1; break;
        case -3: generation = 2; break;
        case  0: generation = 3; break;

        case -1: generation = 1; break;
        case  1: generation = 2; break;
        case -Infinity:
        case  Infinity:
                 generation = 3; break;
      }

      if (isFermion)
      {
        var isQuark = isRed || isGreen || isBlue;
        var isLepton = !isQuark;

        for (var g = generation; g > 1; g--) {
          var temp = gravSpin.left;
          gravSpin.left = gravSpin.right;
          gravSpin.right = weakIsoSpin.right;
          weakIsoSpin.right = temp;
        }

        if (generation == 2 && isLepton)
          B2 = -B2;
        
        if (generation == 3)
        {
          B2 = (v[4] - B2) / 2;
          w  = -v[4] / 2;
        }
      }

      var Q = weakIsoSpin.left + weakIsoSpin.right - B2;

      var name, shape, color;
      if (isFermion)
      {
        var isAntiMatter = (Q * 3 == 1) || (Q == -2/3) || (Q == 1) || (Q == 0 && w == 1/2);
        var isUpTypeQuark = isQuark && (Q == 2/3 || Q == -2/3);
        var isNeutrino = isLepton && (Q == 0);

        name = (isAntiMatter ? "anti " : "") + (isQuark
          ? quarkNames[1 - isUpTypeQuark][generation - 1] + " quark"
          : leptonNames[generation - 1] + (isNeutrino ? " neutrino" : ""));
        shape = isAntiMatter ? DOWN_TRIANGLE : UP_TRIANGLE;

        if (isQuark)
        {
          var l = isUpTypeQuark ? 200 : 255;
          color = { r: l*isRed, g: l*isGreen, b: l*isBlue };
          if (weakIsoSpin.left)
          {
            color.r = 0.5*color.r + 0.5*l;
            color.g = 0.5*color.g + 0.5*l;
            color.b = 0.5*color.b + 0.5*l/2;
          }
        }
        else
        {
          var l = isNeutrino ? 150 : 200;
          color = { r: l, g: l, b: weakIsoSpin.left ? 0 : l };
        }
      }
      else
      {
        color = { 
          r: v[5]*100 - v[0]*50 + v[1]*50 + v[2]*50 + 128, 
          g: v[6]*100 + v[0]*50 + v[1]*50 + v[3]*50 + 128, 
          b: v[7]*100 - v[2]*50 + v[3]*50 + 128
        };
        switch (true)
        {
          case gravSpin.left != 0 && weakIsoSpin.left != 0:
            name  = "e\u03D5"; // e-phi
            shape = SQUARE; 
            break;
          case v[0] != 0:
            name  = "\u03C9"; // omega
            shape = CIRCLE;
            break;
          case weakIsoSpin.left != 0:
            name  = "W"; 
            shape = CIRCLE; 
            break;
          case weakIsoSpin.right != 0:
            name = "B"; 
            shape = CIRCLE; 
            break;
          case B2 != 0:
            name =  "x\u03A6"; // x-Phi
            shape = SQUARE;
            var l = 160;
            color = { r: l*isRed, g: l*isGreen, b: l*isBlue };
            break;
          default:
            name = "g"; 
            shape = CIRCLE;
            break;
        }

        name = name + " gauge boson";
      }

      var elParticle = createShape(shape, generation);
      elParticle.v = ''+v;
      o.el = elParticle;
      elParticle.id = 'particle-' + i;

      elParticle.style.color = 'rgb(' + 
        Math.round(color.r) + ', ' + 
        Math.round(color.g) + ', ' + 
        Math.round(color.b) + ')';
      $('origin').appendChild(elParticle);

      var div = document.createElement('div')
      div.className = 'details';
      div.id = 'details-' + elParticle.id;

      var header = document.createElement('h3')
      setTextContent(header, name);
      div.appendChild(header);

      div.appendChild(
        createDL([
          ['Q:', pp(Q)],
          ['Weak isospin (L, R):',       pp(weakIsoSpin.left) + ', ' + pp(weakIsoSpin.right)],
          ['Gravitational spin (L, R):', pp(gravSpin.left) + ', ' + pp(gravSpin.right)],
          ['E8 coords:', "(" + (v+"").replace(/0\.5/g, "\u00BD") + ')']
        ])
      );

      document.getElementById('details').appendChild(div);
    }
    return vectors;
  }
}

function createShape(shape, size)
{
  var el = document.createElement('div');
  setTextContent(el, shape);
  el.unselectable = "on";
  el.style.fontSize = (17 - (size || 2) * 2) + 'px';
  el.className = "shape";
  return el;
}

var currentDetails = null;
function showDetails(id)
{
  if (currentDetails) {
    var el = document.getElementById(currentDetails)
    if (el) {
      Utils.removeClass(el, 'visible');
      Utils.addClass(el, 'hidden');
    }
    currentDetails = null;
  }
  if (id) {
    currentDetails = 'details-' + id;
    var el = document.getElementById(currentDetails)
    if (el) {
      Utils.addClass(el, 'visible');
      Utils.removeClass(el, 'hidden');
    }
  }
}

function interactions(p)
{
  var r = [];
  for (var id in allParticles)
  {
    var q = allParticles[id].v;
    var a = [];
    for (var i = 0; i < 8; i++)
      a[i] = p[i] + q[i];
    if (allParticles[a])
      r.push([q, a]);
  }
  return r;
}


function canvasOnmouseover(evt)
{
  var el = evt ? evt.target : event.srcElement;
  if (el.id)
    showDetails(el.id);
  if (el.tgt)
    Utils.addClass(allParticles[el.tgt].el, "target");
  if (el.txt && !el.tgt)
    setTextContent(help, "Click on a particle to see with which particles it interacts.");
}

function canvasOnmouseout(evt)
{
  var el = evt ? evt.target : event.srcElement;
  if (el.id)
    showDetails(null);
  if (el.tgt)
    Utils.removeClass(allParticles[el.tgt].el, "target");
  setTextContent(help, defaultHelp);
}

function canvasOnclick(evt)
{
  window.location.hash = "#";
  for (var id in allParticles)
  {
    allParticles[id].el.className = "shape";
    allParticles[id].el.tgt = "";
  }
  setTextContent(help, defaultHelp = "Hover over a particle to see its details.");
  var el = evt ? evt.target : event.srcElement;
  selectParticle(el)
}

function selectParticle(el)
{
  if (el.v)
  {
    window.location.hash = '#' + el.id
    var o = allParticles[el.v];
    Utils.addClass(o.el, "selected");
    var l = interactions(o.v);
    for (var i = 0; i < l.length; i++)
    {
      Utils.addClass(allParticles[l[i][0]].el, "interacts");
      allParticles[l[i][0]].el.tgt = ""+l[i][1];
    }
    setTextContent(help, defaultHelp = "Particles that interact with this particle (red) are indicated with blue. Hover over them to see which particle is the result (green).");
  }
}

var dragData = null, curDragType = null;
function canvasOnmousemove(evt)
{
  if (!buttonDown || curDragType === null)
  {
    dragData = null;
    return;
  }
  
  if (!dragData)
  {
    var el = evt ? evt.target : event.srcElement;
    if (!el.v)
      return;
      
    var dragProj = getProjection(projectionAnims[0]);
    dragData = {
      clientX: evt.clientX,
      clientY: evt.clientY,
      projX: dragProj.x,
      projY: dragProj.y,
      particle: allParticles[el.v],
      x0: parseInt(el.style.left) + (evt.layerX || evt.offsetX || 0),
      y0: parseInt(el.style.top ) + (evt.layerY || evt.offsetY || 0)
    };
  }
  else
  {
    var qNumsProjX = coords2qNums(dragData.projX);
    var qNumsProjY = coords2qNums(dragData.projY);
    
    var x0 = dragData.x0;
    var y0 = -dragData.y0;
    var x1 = x0 + (evt.clientX - dragData.clientX);
    var y1 = y0 - (evt.clientY - dragData.clientY);
    
    var a = (y0 * y1 + x1 * x0) / (x0 *x0 + y0 * y0)
    var b = -x0 * y1 / (x0 *x0 + y0 * y0);
    
    var c = curDragType * 2;
    var x0 = qNumsProjX[c];
    var y0 = qNumsProjY[c];
    qNumsProjX[c] =  a * x0 + b * y0;
    qNumsProjY[c] = -b * x0 + a * y0;
    var c = curDragType * 2 + 1;
    var x0 = qNumsProjX[c];
    var y0 = qNumsProjY[c];
    qNumsProjX[c] =  a * x0 + b * y0;
    qNumsProjY[c] = -b * x0 + a * y0;
    
    var projection = getProjection('User')    
    projection.x = qNums2coords(qNumsProjX);
    projection.y = qNums2coords(qNumsProjY);
    
    showProjNow("User");
  }
  
}

function initProjInputs()
{
  projInputs             = $('projInputs')
  projInputs.onmousemove = projInputsOnmousemove
  projInputs.ondblclick  = projInputsOndblclick
  projInputs.onclick     = projInputsOnclick
  
  for (var i = 0; i < 4; i++)
  {
    var projInput = $("projInput" + (i + 1));
    projInput.appendChild(createShape(CIRCLE, 3)).id = "projInputIndicator" + (i * 2);
    projInput.appendChild(createShape(CIRCLE, 3)).id = "projInputIndicator" + (i * 2 + 1);
  }
}

function projInputsOnmousemove(evt)
{
  if (!buttonDown)
    return;
  
  evt = evt || event;
  var x = ((evt.layerX || evt.offsetX || 0) - projInputCenter) / projInputScale;
  var y = ((evt.layerY || evt.offsetY || 0) - projInputCenter) / projInputScale;
  var el = evt.target || evt.srcElement;
  
  setUserProj(el, x, -y);
}

function projInputsOndblclick(evt)
{
  var el = evt.target || evt.srcElement;
  setUserProj(el, 0, 0);
}

function projInputsOnclick(evt)
{
  curDragType = null;
  var el = evt.target || evt.srcElement;
  if (el.id)
  {
    var n = el.id.charCodeAt(9) - 49;
    if (n < 0 || n > 3)
      return;
    
    curDragType = n;
  }
}

function setUserProj(el, x, y)
{
  if (!el.id)
    return;
  
  var n = el.id.charCodeAt(9) - 49;
  if (n < 0 || n > 3)
    return;
    
  var projection = this.getProjection('User')

  var qNumsProjX = coords2qNums(projection.x);
  var qNumsProjY = coords2qNums(projection.y);

  qNumsProjX[n * 2    ] =  x;
  qNumsProjY[n * 2    ] =  y;
  qNumsProjX[n * 2 + 1] = -y;
  qNumsProjY[n * 2 + 1] =  x;

  projection.qx = qNumsProjX;
  projection.qy = qNumsProjY;
  projection.x = qNums2coords(qNumsProjX);
  projection.y = qNums2coords(qNumsProjY);
  
  showProjNow("User");
}

function showProjNow(id)
{
  calcProj(id);
  animStart -= 3000;
  projectionAnims[1] = id;
  projectionAnims.length = 2;
  projSelect.value = id;
}

function coords2qNums(v)
{
  return [
    ( v[0] + v[1]) / Math.sqrt(2),
    (-v[0] + v[1]) / Math.sqrt(2),
    ( v[2] + v[3]) / Math.sqrt(2),
    (-v[2] + v[3]) / Math.sqrt(2),
    v[4],
    (-v[5] - v[6] - v[7]) / Math.sqrt(3),
    (-v[5] + v[6]) / Math.sqrt(2),
    (-v[5] - v[6]) / Math.sqrt(6) + v[7] / Math.sqrt(3/2)
  ];
}

function qNums2coords(v)
{
  return [
    (v[0] - v[1]) / Math.sqrt(2),
    (v[0] + v[1]) / Math.sqrt(2),
    (v[2] - v[3]) / Math.sqrt(2),
    (v[2] + v[3]) / Math.sqrt(2),
    v[4],
    -v[5] / Math.sqrt(3) - v[7] / Math.sqrt(6) - v[6] / Math.sqrt(2),
    -v[5] / Math.sqrt(3) - v[7] / Math.sqrt(6) + v[6] / Math.sqrt(2),
    -v[5] / Math.sqrt(3) + v[7] / Math.sqrt(3/2)
  ];
}

function anim()
{
  if (projectionAnims.length > 1)
  {
    var t = (new Date() - animStart) / 3000;
    var curId = projectionAnims[0];
    var nextId = projectionAnims[1];
    var t1 = Math.min(t, 1);
    var f = t1 - Math.sin(2 * Math.PI * t1) / 2 / Math.PI;
    for (var id in allParticles)
    {
      var o = allParticles[id];
      // Math.round to prevent tiny numbers serialized with 'e' which does't work in CSS.
      o.el.style.left = Math.round(o.x[curId] * (1 - f) + o.x[nextId] * f) + 'px';
      o.el.style.top  = Math.round(o.y[curId] * (1 - f) + o.y[nextId] * f) + 'px';
    }
    var curProj = getProjection(curId);
    var nextProj = getProjection(nextId);
    for (var i = 0; i < 8; i++)
    {
      var projInput = $("projInputIndicator" + i);
      projInput.style.left = Math.round(projInputCenter + projInputScale * (curProj.qx[i] * (1 - f) + nextProj.qx[i] * f)) + 'px';
      projInput.style.top  = Math.round(projInputCenter - projInputScale * (curProj.qy[i] * (1 - f) + nextProj.qy[i] * f)) + 'px';
    }
    
    if (t > 1)
    {
      projectionAnims.shift();
      animStart = new Date();
    }
  }
  setTimeout(anim, 20);
}

function init()
{
  details    = $('details')
  help       = $('help')
  projSelect = $('projSelect')
  
  document.body.onmousedown = function() { buttonDown = true; };
  document.body.onmouseup   = function() { buttonDown = false; };
  
  projection             = $('projection')
  projection.onmouseover = canvasOnmouseover
  projection.onmouseout  = canvasOnmouseout
  projection.onclick     = canvasOnclick
  projection.onmousemove = canvasOnmousemove

  projSelect.onchange = projSelectOnchange;
  
  setTextContent(help, defaultHelp);
  
  var E8 = new E8Thing;
  
  E8.initParticles();
  initProj();
  initProjInputs();

  addAnim('Zero');
  // addAnim('Overview');
  addAnim('Overview');
  anim();
  
  if (window.location.hash) {
    var id = window.location.hash.substring(1);
    selectParticle($(id))
    showDetails(id)
  }
}