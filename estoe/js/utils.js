function $(id)
{
  return document.getElementById(id);
}

function createDL(arr)
{
  var dl = document.createElement('dl');
  for (var i = 0, l = arr.length; i < l; ++i) {
    var item = arr[i];
    var dt = document.createElement('dt');
    var dd = document.createElement('dd');
    dt.appendChild(document.createTextNode(item[0]));
    dd.appendChild(document.createTextNode(item[1]));
    dl.appendChild(dt);
    dl.appendChild(dd);
  }
  return dl;
}

function setTextContent(el, value)
{
  el.innerText = el.textContent = value;
}