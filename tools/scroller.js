var store;
var scroller;

function initScroller()
{
  scroller = document.getElementById("content");
  var footer = document.getElementById("footer");

  var bodyHeight = document.body.clientHeight;
  document.body.style.height = "100%";
  bodyHeight = document.body.clientHeight - bodyHeight;
  
  bodyHeight += 2000 - scroller.offsetTop;
  
  scroller.style.height = bodyHeight + 'px';
  
  store = {
    top: scroller.offsetTop,
    height: 0,
    bottom: scroller.offsetTop + bodyHeight,
    parts: []
  };
  
  var newEl = document.createElement("div");
  newEl.innerHTML = scroller.innerHTML;
  newEl.style.position = 'absolute';
  //newEl.style.padding = "1em 10.5em 1em 17em";
  newEl.style.width = scroller.getElementsByTagName("div")[0].offsetWidth + 'px';
  //document.body.insertBefore(newEl, scroller);
  scroller.insertBefore(newEl, scroller.firstChild);

//  findHeaders(scroller, store, 2);
}

function findHeaders(container, store, level)
{
  var name = "h"+level;
  var headers = container.getElementsByTagName(name);
  var top = store.top + store.height;
  for (var i = 0; i < headers.length; i++)
  {
    var header = headers[i];
    var newHeader = createCopy(header);
    newHeader.style.background = "#EDEDF0";
    newHeader.style.zIndex = 5 - level;
    newHeader.style.width = header.offsetWidth + 'px';
    newHeader.style.left = header.offsetLeft + scroller.offsetLeft + 'px';
    var height = header.offsetHeight;
    var o = {
      ori: header,
      copy: newHeader,
      top: top,
      height: height,
      parts: []
    };
    newHeader.style.top = top + 'px';
    top += height;
    store.parts.push(o);
  }
  var bottom = store.bottom;
  for (var i = store.parts.length-1; i >= 0; i--)
  {
    var o = store.parts[i];
    bottom -= o.height;
    o.bottom = bottom;
    findHeaders(o.ori.parentNode, o, level + 1);
  }
}

function createCopy(el)
{
  var newEl = document.createElement(el.nodeName);
  newEl.innerHTML = el.innerHTML;
  newEl.style.position = 'absolute';
  document.body.appendChild(newEl);
  return newEl;
}

function doScroll()
{
}