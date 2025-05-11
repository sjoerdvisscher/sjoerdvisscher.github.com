// Give a name to the global object, so we can make constructors global.
GLOBAL = this

// Helper function for subclassing. Creates constructors that don't need "new".
Function.prototype.subclass = function(init)
{
  var ctor = function (args)
  {
    if (this == GLOBAL)
      return new ctor(arguments)
    if (args)
      init.apply(this, args)
  }
  ctor.prototype = new this()
  ctor.prototype.constructor = ctor
  return ctor
}

// We're going to need an identity function.
function id(x) x

// Create the base class for all algebraic data types.
function AlgDataType() {}
// Create a class that represents recursion in the type declaration.
function TypeRecursion() {}
// Create a class that represents a type parameter in the type declaration.
function TypeParam(pos) { this.pos = pos }

// getTransformer for instantiated parameterized types.
AlgDataType.prototype.getTransformer = function(conf) let (typeParams = this.typeParams)
  this.constructor.getTransformer({
    name       : conf.name,
    unfoldCtors: conf.unfoldCtors,
    // The type parameter now has a value, so call it's getTransformer instead of using conf.getParamXF.
    getParamXF : function(pos) typeParams[pos].getTransformer(conf),
    getCtorXF  : conf.getCtorXF,
    getAtomXF  : conf.getAtomXF
  })

// More getTransformer implementations
TypeRecursion.prototype.getTransformer = function(conf) conf.transformer
TypeParam.prototype.getTransformer     = function(conf) conf.getParamXF(this.pos) || id
Function.prototype.getTransformer      = function(conf) conf.getAtomXF(this) || id

var confNameCounter = 0

// The Data function declares data types.
function Data(declFn)
{
  // Create the type constructor, which Data will return.
  var typeCtor = AlgDataType.subclass(function () { this.typeParams = arguments })
  
  var declArgs = [new TypeRecursion()]
  for (i = 0; i < declFn.length - 1; i++)
    declArgs.push(new TypeParam(i))
  
  // Call the data type declaration function with TypeRecursion and TypeParam arguments.
  var decl = declFn.apply(this, declArgs)
  
  // Create the constructors.
  var ctors = {}
  for (var pName in decl)
  {
    if (decl[pName].constructor != Array && decl[pName].constructor != Object)
      decl[pName] = [decl[pName]]
    var ctor = decl2ctor(decl[pName], typeCtor)
    ctor.name = pName
    ctors[pName] = ctor
    GLOBAL[pName] = ctor.singleton || ctor
  }
  
  // Implement getTransformer for this type.
  typeCtor.getTransformer = function(conf)
  {
    var confName = conf.name || "__p" + confNameCounter++
    // Make a complete transformation configuration by providing defaults.
    var completeConf = {
      name        : confName,
      propName    : conf.propName,
      unfoldCtors : conf.unfoldCtors || {},
      getCtorXF   : conf.getCtorXF   || id,
      getParamXF  : conf.getParamXF  || function(pos ) id,
      getAtomXF   : conf.getAtomXF   || function(ctor) id,
      transformer : conf.transformer || (conf.generator 
        ? function(x) conf.generator(x, completeConf.unfoldCtors)
        : function(x) x[confName]()
      )
    }
    // Add the value transformations for each constructor to its prototype.
    for (var pName in ctors)
      ctors[pName].addValueXF(completeConf)
    // Store the configuration on the transformer, so we can merge it with another transformer.
    completeConf.transformer.conf = conf
    completeConf.transformer.typeCtor = typeCtor
    // Return the transformer
    return completeConf.transformer
  }
  
  // Derive all properties for this type.
  for (var name in Data.derivedProperties)
    typeCtor.getTransformer(Data.derivedProperties[name])
      
  return typeCtor
}

// Create a constructor from a declaration.
function decl2ctor(decl, typeCtor)
{
  // Subclass the adt.
  var ctor = typeCtor.subclass(function() { 
    for (var i = 0; i < props.length; i++) 
      this[props[i]] = arguments[i]
  })
  
  // Collect the declared properties in an array.
  var props = []
  for (var p in decl)
    if (decl.hasOwnProperty(p))
      props.push(p)
  ctor.props = props
  
  ctor.addValueXF = function(conf)
  {
    // Get the transformation function for the constructor.
    var ctorXF = conf.getCtorXF(ctor)
    // Get the transformation for each argument of the constructor.
    var argsXF = [ decl[props[i]].getTransformer(conf) for (i in props) ]
    // Combine them in a value transformation function, and store it on the prototype.
    ctor.prototype[conf.name] = 
      function() ctorXF.apply(GLOBAL, [ argsXF[i](this[props[i]]) for (i in props) ])
    // Add a similar function to the collection of unfold constructors.
    conf.unfoldCtors[ctor.name] = props.length 
      ? function() ctorXF.apply(GLOBAL, [ argsXF[i](arguments[i]) for (i in props) ]) 
      : ctorXF()
    // Add a getter if this is a configuration of a derived property.
    if (conf.propName)
      ctor.prototype.__defineGetter__(conf.propName, ctor.prototype[conf.name])
  }
  
  // Create a singleton if the constructor has no arguments.
  if (props.length == 0)
    ctor.singleton = new ctor
    
  return ctor
}

// The code for derived properties.
Data.derivedProperties = {}
Data.addDerivedProperty = function(name, conf)
{
  conf.propName = name
  return Data.derivedProperties[name] = conf
}

// The code for merging two configurations.
function mergeFns(f,g) f && g ? function(x) g(f(x)) : f || g || id
function mergeFns2(f, g) 
  let (f = f || function() null, g = g || function() null)
    function(x) mergeFns(f(x), g(x))

// To merge two transformers, create a transformer from their merged configurations.
Function.prototype.merge = function(that)
  this.typeCtor.getTransformer({
    getCtorXF:  mergeFns( this.conf.getCtorXF,  that.conf.getCtorXF),
    getParamXF: mergeFns2(this.conf.getParamXF, that.conf.getParamXF),
    getAtomXF:  mergeFns2(this.conf.getAtomXF,  that.conf.getAtomXF),
    generator:  this.conf.generator || that.conf.generator
  })

// Fold, map, unfold and getCollectFn only apply to type constructors, but javascript has no function subclassing.
// So just put them on all functions.

// Fold requires a dictionary from constructor names to functions (or a value if the constructor has no arguments).
Function.prototype.fold = function(fns)
  this.getTransformer({
    getCtorXF: function(ctor) 
      let (fn = fns[ctor.name]) 
        fn !== undefined ? ctor.singleton ? function() fn : fn : ctor
  })

// Map requires a function for each type parameter.
Function.prototype.map = function() let (maps = arguments)
  this.getTransformer({
    getParamXF: function(pos) maps[pos]
  })

// Unfold requires a function with 2 arguments, a seed value and a dictionary with a stand-in function for each constructor.
Function.prototype.unfold = function(g)
  this.getTransformer({
    generator: g
  })

// getCollectFn needs a boolean value for each type parameter.
// It returns a collect function that only collects values in the positions for which true was passed.
Function.prototype.getCollectFn = function() let (incl = arguments)
  this.getTransformer({
    getCtorXF : function(ctor) function() Array.collect(arguments),
    getParamXF: function(pos ) incl[pos] ? function(x) [x] : function(x) [],
    getAtomXF : function(ctor) function() []
  })
    
// The default transformation changes nothing, so the clone property needs no configuration.
Data.addDerivedProperty("clone", {})

// Add toString and toSource via the derived property "source".
Number.prototype.toSource = Boolean.prototype.toSource = function() this.toString()
String.prototype.toSource = function() "\"" + this.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\""
AlgDataType.prototype.toString = AlgDataType.prototype.toSource = function() this.source
Data.addDerivedProperty("source", {
  getCtorXF : function(ctor) function() ctor.name + (arguments.length ? "(" + Array.join(arguments, ", ") + ")" : ""),
  getParamXF: function(pos ) function(x) x.toSource(),
  getAtomXF : function(ctor) function(x) x.toSource()
})

// The "equals" derived property returns a function (so it works like a method).
String.prototype.equals = Number.prototype.equals = Boolean.prototype.equals = function(that) this == that
Data.addDerivedProperty("equals", {
  getCtorXF : function(ctor) function() let (eqFns = arguments) 
    function(y) y.constructor == ctor && Array.every([ eqFns[i](y[ctor.props[i]]) for (i in ctor.props) ], id),
  getParamXF: function(pos ) function(x) function (y) x.equals(y),
  getAtomXF : function(ctor) function(x) function (y) x.equals(y)
})

// The "size" property counts the leafs.
Array.sum = function(list) Array.reduce(list, function(x, y) x + y, 0)
Data.addDerivedProperty("size", {
  getCtorXF : function(ctor) function() Array.sum(arguments),
  getParamXF: function(pos ) function() 1,
  getAtomXF : function(ctor) function() 1
})

// The "items" property returns an array with all the leafs.
Array.collect = function(list) Array.reduce(list, function(a, b) a.concat(b), [])
Data.addDerivedProperty("items", {
  getCtorXF : function(ctor) function() Array.collect(arguments),
  getParamXF: function(pos ) function(x) [x],
  getAtomXF : function(ctor) function(x) [x]
})