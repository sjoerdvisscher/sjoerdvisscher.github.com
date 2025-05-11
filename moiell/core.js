var resultStream, compileDebug;
function run(source)
{
  var ts = new TokenStream(source);
  var uts = new UnescapedTokenStream(ts);
  var wsats = new WSAnnotatedTS(uts);
  var sits = new SemanticIndentationTS(wsats);
  var nts = new NestedTokenStream(sits, BOF);
  try 
  {
    var ast = new ExprStream(nts).toJoinExpr();  

    resultStream = ast.evaluate(NEW(initEnvNode));

    compileDebug = document.getElementById("compileDebug");
    compileDebug.firstChild.nodeValue = "";

    next(100);
  }
  catch(e) 
  { 
    alert(e); 
  }
};

function next(n)
{
  try 
  {
    var value = resultStream.next();

    compileDebug.firstChild.nodeValue += value.toMoiellSource() + "\n\r";
    if (n)
      setTimeout(function() { next(n - 1); }, 0);
  }
  catch (err if err instanceof StopIteration)
  {
    compileDebug.firstChild.nodeValue += "Done.";
  }
  catch (e)
  {
    alert(e);
  }
}


NEW=function(o) {
  var f=function() {}; 
  f.prototype=o; 
  var n=new f();
  n.proto = o;
  return n;
}

/**
 * Value = Number | String | Token | Function | Node
 * ValueStream impl Value*
 * Expr impl Node -> ValueStream
 * Node impl Token -> Node
 * Node impl ValueStream*
 * Function impl ValueStream -> ValueStream
 */

var emptyStream = (function() { return; yield; })();

function literalStream(value)
{
  yield value;
}

function head(stream)
{
  try
  {
    return stream.next();
  }
  catch (err if err instanceof StopIteration)
  {
    return null;
  }
}  

function Node() {}
Node.prototype.setStream = function(stream)
{
  this.stream = stream;
  this.cache = [];
};
Node.prototype.getStream = function()
{
  var detectRecursion;
  for (var i = 0; true; i++)
  {
    if (this.cache[i] === undefined)
      this.cache[i] = this.stream.next(); 
    
    yield this.cache[i];
  };
};

function cache(stream)
{
  var node = new Node();
  node.setStream(stream);
  return node;
}

/**
 * Expressions
 */

function Expr() {}
Expr.prototype.join = function(expr2)
{
  return new JoinExpr([this, expr2]);
};

LiteralExpr = Expr.subClass(function(value) {
  this.value = value;
});

VarExpr = Expr.subClass(function(token) {
  this.token = token;
});

VarRefExpr = Expr.subClass(function(token) {
  this.token = token;
});

LetExpr = Expr.subClass(function(tokensExpr, valueExpr)
{
  this.tokensExpr = tokensExpr;
  this.valueExpr = valueExpr;
});

JoinExpr = Expr.subClass(function(exprs)
{
  this.exprs = exprs;
  this.locals = [];
  for (var i = 0; i < this.exprs.length; i++)
    this.exprs[i].getLocals(this.locals);
});

ArgExpr = Expr.subClass(function() {});

AbstractExpr = Expr.subClass(function(functionType, tokensExpr, valueExpr)
{
  this.functionType = functionType;
  this.tokensExpr = tokensExpr;
  this.valueExpr = valueExpr;
});

ApplyExpr = Expr.subClass(function(fnsExpr, argsExpr)
{
  this.fnsExpr = fnsExpr;
  this.argsExpr = argsExpr;
});
 
LiftNodeExpr = Expr.subClass(function(valueExpr)
{
  this.valueExpr = valueExpr;
});

UnliftNodeExpr = Expr.subClass(function(valueExpr)
{
  this.valueExpr = valueExpr;
});

/**
 * Serialize expressions.
 */
LiteralExpr.prototype.toMoiellSource = function()
{
  return this.value.toMoiellSource();
};

VarExpr.prototype.toMoiellSource = function()
{
  return this.token.value;
};
 
JoinExpr.prototype.toMoiellSource = function()
{
  return this.exprs.toMoiellSource();
};

LetExpr.prototype.toMoiellSource = function()
{
  return this.tokensExpr.toMoiellSource() + " = " + this.valueExpr.toMoiellSource();
};

AbstractExpr.prototype.toMoiellSource = function()
{
  return this.tokensExpr.toMoiellSource() + 
    (this.functionType == CallByName ? " => " : " -> ") + 
    this.valueExpr.toMoiellSource();
};

ApplyExpr.prototype.toMoiellSource = function()
{
  return this.fnsExpr.toMoiellSource() + "(" + this.argsExpr.toMoiellSource() + ")";
};


/**
 * Get tokens used in expressions.
 */
Expr.prototype.getTokens = function(a) {};

VarRefExpr.prototype.getTokens = function(a)
{
  a.push(this.token);
};

JoinExpr.prototype.getTokens = function(a)
{
  for (var i = 0; i < this.exprs.length; i++)
    this.exprs[i].getTokens(a);
};

/**
 * Get local variables.
 */
Expr.prototype.getLocals = function(a) {};

LetExpr.prototype.getLocals = function(a)
{
  this.tokensExpr.getTokens(a);
};


/**
 * Evaluate expressions. Environment -> ValueStream
 */

LiteralExpr.prototype.evaluate = function(envNode)
{
  return literalStream(this.value);
};

VarExpr.prototype.evaluate = function(envNode)
{
  if (!envNode[this.token.value])
    throw "Undefined variable: " + this.token.debug();
  return envNode[this.token.value].getStream();
};

VarRefExpr.prototype.evaluate = function(envNode)
{
  if (!envNode[this.token.value])
    throw "Undefined variable: " + this.token.debug();
  yield envNode[this.token.value];
};

LetExpr.prototype.evaluate = function(envNode)
{
  var storageNodes = [n for (n in this.tokensExpr.evaluate(envNode))];
  storageNodes.assign(this.valueExpr.evaluate(envNode));
  return emptyStream;
};

JoinExpr.prototype.evaluateToNode = function(envNode, argsStream)
{
  envNode = NEW(envNode);
  envNode["?"] = argsStream;
  
  // Create storage for each local.
  for (var i = 0; i < this.locals.length; i++)
    envNode[this.locals[i].value] = new Node();
  
  // Get a stream from each expression.
  var streams = [];
  for (var i = 0; i < this.exprs.length; i++)
    streams[i] = this.exprs[i].evaluate(envNode);
  
  // Join streams.
  envNode.setStream(function() {
    for (var i = 0; i < streams.length; i++)
      for (var value in streams[i])
        yield value;
  }());
  return envNode;
};
JoinExpr.prototype.evaluate = function(envNode, argsStream)
{
  return this.evaluateToNode(envNode, argsStream).stream;
};

ArgExpr.prototype.evaluate = function(envNode)
{
  return envNode["?"];
};

AbstractExpr.prototype.evaluate = function(envNode)
{
  var bodyExprs = this.valueExpr.exprs || [this.valueExpr];
  var argsAssignExpr = new LetExpr(this.tokensExpr, new ArgExpr());
  var valueExpr = new JoinExpr([argsAssignExpr].concat(bodyExprs));
  return literalStream(new this.functionType(valueExpr, envNode));
};

ApplyExpr.prototype.evaluate = function(envNode)
{
  for (var fn in this.fnsExpr.evaluate(envNode))
    for (var v in fn.invoke(this.argsExpr.evaluate(envNode)))
      yield v;
};

LiftNodeExpr.prototype.evaluate = function(envNode)
{
  return literalStream(this.valueExpr.evaluateToNode(envNode));
};

UnliftNodeExpr.prototype.evaluate = function(envNode)
{
  for (var node in this.valueExpr.evaluate(envNode))
    for (var value in node.getStream())
      yield value;
};

/**
 * Functions: ValueStream -> ValueStream
 */

function CallByName(valueExpr, envNode)
{
  this.valueExpr = valueExpr;
  this.envNode = envNode;
};
CallByName.prototype.invoke = function(argsStream)
{
  return this.valueExpr.evaluate(this.envNode, argsStream);
};

function CallByValue(valueExpr, envNode)
{
  this.valueExpr = valueExpr;
  this.cbnFn = new CallByName(valueExpr, envNode);
};
CallByValue.prototype.invoke = function(argsStream)
{
  for (var argValue in argsStream)
    for (var value in this.cbnFn.invoke(literalStream(argValue)))
      yield value;
};

Function.prototype.invoke = function(argsStream)
{
  return this(argsStream);
};

// Storage assignment.
Array.prototype.assign = function(valueStream)
{ 
  if (this.length == 1)
  {
    this[0].setStream(valueStream);
  }
  else
  {
    var a = [];
    for (var i = 0; i < this.length - 1; i++)
    {
      var value = head(valueStream);
      if (value === null)
      {
        for (; i < this.length; i++)
          this[i].setStream(emptyStream);
        return false;
      }
      this[i].setStream(literalStream(value));
    }
    this[this.length - 1].setStream(valueStream);
  }

  return true;
};

var initEnvNode = new Node();
var initEnvNodeProps = {

  "@": function(argsStream) {
    for (var arg in argsStream)
      ; // Do nothing.
    return emptyStream;
  },

  
  "[": function(filteree) {
    return literalStream(function(filterStream) {
      var filterNode = cache(filterStream);
      for (var val in filteree)
        for (var filter in filterNode.getStream())
          if (head(filter.invoke(literalStream(val))) !== null)
          {
            yield val;
            break;
          }
    });
  },

  "And": function(args1Stream) {
    return literalStream(function(args2Stream) {
      return head(args1Stream) === null ? emptyStream : args2Stream;
    });
  },
  "Or": function(args1Stream) {
    return literalStream(function(args2Stream) {
      var value = head(args1Stream);
      if (value === null)
        return args2Stream;
      return function() {
        yield value;
        for (var v in args1Stream)
          yield v;
      }();
    });
  },
  
  "+": binOp("+"),
  "-": binOp("-"),
  "*": binOp("*"),
  "/": binOp("/"),
  "mod": binOp("%"),
  
  ">": binCompOp(">"),
  ">=": binCompOp(">="),
  "<": binCompOp("<"),
  "<=": binCompOp("<="),
  "==": binCompOp("=="),
  "!=": binCompOp("!=")
  
};

for (var p in initEnvNodeProps)
  initEnvNode[p] = cache(literalStream(initEnvNodeProps[p]));

function binOp(op)
{
  return new Function("args1Stream", "return literalStream(function(args2Stream) { var args2StreamNode = cache(args2Stream); for (var arg1 in args1Stream) for (var arg2 in args2StreamNode.getStream()) { var val = arg1 " + op + " arg2; if (val || val === 0 || val === '') yield val; }});");
}

function binCompOp(op)
{
  return new Function("args1Stream", "return literalStream(function(args2Stream) { var args2StreamNode = cache(args2Stream); for (var arg1 in args1Stream) for (var arg2 in args2StreamNode.getStream()) if (arg1 " + op + " arg2) yield arg1;});");
}
 

var expressionImpls = [
  { args:[StringToken], 
    fn: function(token) { return new LiteralExpr(eval(token.value)); }},
  { args:[NumberToken], 
    fn: function(token) { return new LiteralExpr(eval(token.value)); }},
  { args:[TokenToken], 
    fn: function(token) { return new VarRefExpr(token); }},
  { args:[Token], 
    fn: function(token) { return new VarExpr(token); }},
  { args:[NestedTokenStream],
    fn: function(stream) { return new ExprStream(stream).toJoinExpr(); }},

  { args:[new VarExpr('('), Expr], 
    fn: function(op, args) { return args; }},
  { args:[new VarExpr(IndentToken), Expr], 
    fn: function(op, args) { return args; }},
  { args:[new VarExpr('['), Expr], 
    fn: function(op, args) { return new AbstractExpr(CallByValue, new VarRefExpr(new Token("_")), args); }},
  { args:[new VarExpr('{'), Expr], 
    fn: function(op, args) { return new LiftNodeExpr(args); }},
  { args:[new VarExpr('*'), Expr], 
    fn: function(op, args) { return new UnliftNodeExpr(args); }},
  { args:[Expr, Expr], 
    fn: function(op, args) { return new ApplyExpr(op, args); }},

  { args:[new VarExpr('.'), Expr, Expr], 
    fn: function(op, args1, args2) { return new ApplyExpr(args2, args1); }},
  { args:[new VarExpr(','), Expr, Expr], 
    fn: function(op, args1, args2) { return args1.join(args2); }},
  { args:[new VarExpr('('), Expr, Expr], 
    fn: function(op, args1, args2) { return new ApplyExpr(args1, args2); }},
  { args:[new VarExpr(IndentToken), Expr, Expr], 
    fn: function(op, args1, args2) { return new ApplyExpr(args1, args2); }},
  { args:[new VarExpr('=>'), Expr, Expr], 
    fn: function(op, tokens, value) { return new AbstractExpr(CallByName, tokens, value); }},
  { args:[new VarExpr('->'), Expr, Expr], 
    fn: function(op, tokens, value) { return new AbstractExpr(CallByValue, tokens, value); }},
  { args:[new VarExpr('='), Expr, Expr], 
    fn: function(op, tokens, value) { return new LetExpr(tokens, value); }},
  { args:[Expr, Expr, Expr], 
    fn: function(op, args1, args2) { return new ApplyExpr(new ApplyExpr(op, args1), args2); }}
];
function expression(x, y, z)
{
  outer: for (var i = 0; i < expressionImpls.length; i++)
  {
    var impl = expressionImpls[i];
    
    if (impl.args.length != arguments.length)
      continue;
    
    for (var j = 0; j < arguments.length; j++)
      if (!impl.args[j].hasInstance(arguments[j]))
        continue outer;
    
    return impl.fn.apply(this, arguments);
  }
  throw "No matching implementation found in expression for: " + Array.prototype.toMoiellSource.apply(arguments);
}

Function.prototype.hasInstance = function(f)
{
  return f instanceof this;
};
String.prototype.hasInstance = function(s)
{
  return (''+s) == this;
};
Object.prototype.hasInstance = function(o)
{
  if (this.constructor != o.constructor)
    return false;
  
  for (var p in this)
    if (this.hasOwnProperty(p))
      if (!this[p].hasInstance(o[p]))
        return false;
  
  return true;
};
