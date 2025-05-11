var Utils = Utils || {};

Utils.getClass = function(el)
{
  return el.className
}

Utils.setClass = function(el, cn)
{
  cn = cn.replace(/\s+/g, ' ')
  if (cn != el.className)
    el.className = cn
}

Utils.addClass = function(el, cn)
{
  Utils.setClass(el, Utils.getClass(el) + ' ' + cn)
}

Utils.removeClass = function(el, cn)
{
  Utils.setClass(el, Utils.getClass(el).replace(cn, ''))
}