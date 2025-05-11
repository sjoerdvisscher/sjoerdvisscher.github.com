Array.prototype.times = function(as)
{
  var r = [];
  for (var i = 0; i < this.length; i++)
    for (var j = 0; j < as.length; j++)
      r.push(this[i].concat(as[j]));
  return r;
}
Array.prototype.addMult = function(a, f)
{
  var r = this.concat([]);
  for (var i = 0; i < a.length; i++)
    r[i] += f * a[i];
  return r;
}
Array.prototype.unit = function()
{
  var l2 = 0;
  for (var i = 0; i < this.length; i++)
    l2 += this[i] * this[i];
  var f = 1 / Math.sqrt(l2);
  for (var i = 0; i < this.length; i++)
    this[i] *= f;
  return this;
}