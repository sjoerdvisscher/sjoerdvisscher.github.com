/**

Program ::= Exprs
Exprs ::= Sep* | Sep* Expr Sep Epxrs
Sep ::= WS* (";", ",", nl) WS*
Expr ::= SimpleExpr | Expr WS+ SimpleExpr WS+ Expr
SimpleExpr ::= Atom | Prefix SimpleExpr | SimpleExpr Postfix | Circumfix
Prefix ::= Operator
Postfix ::= Circumfix
Circumfix ::= Indent Exprs Unindent | "(" Exprs ")" | "{" Exprs "}" | "[" Exprs "]"
Atom ::= Number | String | Operator | Identifier

**/

Function.prototype.subClass = function(constructor, methods)
{
  constructor.prototype = new this();
  constructor.prototype.constructor = constructor;
  for (var m in methods)
    constructor[m] = methods[m];
  return constructor;
};

/**
 * Token definitions
 */

function Token(value, line)
{
  this.value = value;
  this.line = line;
};
Token.prototype.toString = function()
{
  return this.value;
};
Token.prototype.debug = function() 
{
  return this.value.replace(/ /g, "[sp]").replace(/\n|\r/g, "").replace(/\t/g, "[tab]") + (this.line != undefined ? " at line " + this.line : "");
};

function createTokenType()
{
  return Token.subClass(function() {
    Token.apply(this, arguments);
  });
}

NoToken           = createTokenType();
IndentationToken  = createTokenType();
WhitespaceToken   = createTokenType();
IndentToken       = createTokenType();
UnindentToken     = createTokenType();
OpenBracketToken  = createTokenType();
CloseBracketToken = createTokenType();
SeparatorToken    = createTokenType();
OperatorToken     = createTokenType();
IdentifierToken   = createTokenType();
NumberToken       = createTokenType();
StringToken       = createTokenType();
TokenToken        = createTokenType();

BOF = new IndentationToken("", 0);
BOF.debug = function() { return "Beginning of file." };
EOF = new IndentationToken("", 0);
EOF.debug = function() { return "End of file." };


function Stream() {}
Stream.prototype.next = function()
{
  if (this.pushedBack || this.lastToken === null)
  {
    this.pushedBack = false;
    return this.lastToken;
  }

  return this.lastToken = this.__next();
}
Stream.prototype.pushBack = function()
{
  this.pushedBack = true;
}
Stream.prototype.peek = function()
{
  var token = this.next();
  this.pushedBack = true;
  return token;
}



/**
 * Tokenization step
 */

NoToken.prototype.ignore = true;

TokenStream = Stream.subClass(function (source)
{
  this.source = '\n' + source;
  this.line = 0;
  
  var matches = [
    {match: /\/\*(?:[^*]*\*(?!\/))*[^\*]*\*\/|##[^\n]*|\n[ \t\r]*$/, type: NoToken},
    {match: /\n[ \t\r]*/, type: IndentationToken},
    {match: /\\\n|[ \t\r]+/, type: WhitespaceToken},
    {match: /;/, type: SeparatorToken},
    {match: /[\(\[\{]/, type: OpenBracketToken},
    {match: /[\)\]\}]/, type: CloseBracketToken},
    {match: /-?(?:[1-9]\d*|0)(?:\.\d+)?(?:e-?\d+)?/, type: NumberToken},
    {match: /[\w_][^\s\(\[\{\)\]\}:;.,='"]*/, type: IdentifierToken},
    {match: /!=|<=|>=|==|[\/\+\-\^\!\|\@\<\>\#\\\$\`\~\&\*\:\=]*[\/\+\-\^\!\|\@\<\>\#\\\$\`\~\&\*\.\:]|=|,=|,|\.|\?/, type: OperatorToken},
    {match: /(?:\'(?:[^\'\\]*\\.)*[^\'\\]*\'|\"(?:[^\"\\]*\\.)*[^\"\\]*\")/, type: StringToken}
  ];
  var a = [];
  for (var i = 0; i < matches.length; i++)
    a.push(matches[i].match.source);

  this.re = new RegExp('^(?:('+a.join(')|(')+'))', 'm');
  
  var me = this;
  this.replacer = function() 
  {
    for (var i = 0; i < matches.length; i++)
    {
      var value = arguments[i+1];
      if (value)
      {
        me.line += value.replace(/[^\n]+/g, "").length;
        me.token = new matches[i].type(value, me.line);
        break;
      }
    }
    return "";
  }
});
TokenStream.prototype.__next = function()
{   
  do
  {
    if (this.source == "")
    {
      EOF.line = this.line;
      return EOF;
    }

    this.token = null;
    this.source = this.source.replace(this.re, this.replacer);
    if (!this.token)
      throw 'Could not parse \n' + this.source.match(/([^\n]*)(\n|$)/)[1] + '\n at line ' + this.line + '.';
  } 
  while (this.token.ignore);

  return this.token;
};


/**
 * Find ?-escaped identifiers/operators
 */
 
UnescapedTokenStream = Stream.subClass(function(tokens) {
  this.tokens = tokens;
});
UnescapedTokenStream.prototype.__next = function()
{
  var token = this.tokens.next();
  
  if (token.value == "?")
  {
    var nextToken = this.tokens.next();
    if ((nextToken instanceof IdentifierToken) || (nextToken instanceof OperatorToken))
      return new TokenToken(nextToken.value, nextToken.line);
    else
      this.tokens.pushBack();
  }
  
  return token;
};


/**
 * Interpret whitespace tokens
 */
 
IndentationToken.prototype.isWS = true;
WhitespaceToken.prototype.isWS = true;

function WSAnnotatedTS(tokens)
{
  this.tokens = tokens;
  this.hadNonWSToken = false;
};
WSAnnotatedTS.prototype.next = function()
{
  var token;

  do
  {
    token = this.tokens.next();
    
    // Set WS flags on tokens.
    if (this.hadNonWSToken)
      this.hadNonWSToken.beforeWS = token.isWS;
    else
      token.afterWS = true;
    
    this.hadNonWSToken = token.isWS ? false : token;
  } 
  while (token instanceof WhitespaceToken);
  
  return token;  
};


/**
 * Interpret indentation tokens
 */
 
function SemanticIndentationTS(tokens)
{
  this.tokens = tokens;
  this.indentations = [BOF];
};
SemanticIndentationTS.prototype.next = function()
{
  var usedUnindentRepeatToken = this.unindentRepeatToken;
  var token = this.unindentRepeatToken || this.tokens.next();
  this.unindentRepeatToken = null;
    
  switch (true)
  {
    case token == EOF:
      return EOF;
      
    case token.value == this.indentations[0].value:
      return new SeparatorToken(token.value, token.line);
      
    case token.value.indexOf(this.indentations[0].value) == 0:
      if (usedUnindentRepeatToken)
        throw token.debug() + " unindents to an invalid position.";

      this.indentations.unshift(token);
      return new IndentToken(token.value, token.line, token.line==1?'beginning of file':''+token);

    case this.indentations[0].value.indexOf(token.value) == 0:
      this.indentations.shift();
      this.unindentRepeatToken = token;
      return new UnindentToken(token.value, token.line, ''+token);

    case token instanceof IndentationToken:
      throw token.debug() + " does not match " + this.indentations[0];
    
    default:
      return token;
  }
  
};
SemanticIndentationTS.prototype.toString = function()
{
  var a = [];
  for (var token = this.next(); token != EOF; token = this.next())
    a.push(token.toMoiellSource());
  return a.join('\n');
};


/**
 * Nest tokens
 */

IndentToken.prototype.matches = function(token)
{
  return token instanceof UnindentToken;
};
OpenBracketToken.prototype.matches = function(token)
{
  return token.value == {"{" : "}", "[" : "]", "(" : ")"}[this.value];
};

NestedTokenStream = Stream.subClass(function(tokens, startToken) {
  this.tokens = tokens;
  this.startToken = startToken;
  this.ignoreIndent = true;
  this.afterWS = this.startToken.afterWS;
});
NestedTokenStream.prototype.__next = function()
{
  for (var token; token = this.tokens.next(); )
  {
    switch (token.constructor)
    {
      case IndentToken:
        if (this.ignoreIndent)
        {
          this.ignoreIndent = false;
          this.ignoreUnindent = true;
          break;
        }
      case OpenBracketToken: 
        return new NestedTokenStream(this.tokens, token);
        
      case UnindentToken:
        if (this.ignoreUnindent)
        {
          this.ignoreUnindent = false;
          break;
        }
      case CloseBracketToken: 
        if (!this.startToken.matches(token))
          throw token.debug() + " does not match " + this.startToken.debug();
        
        this.endToken = token;
        this.beforeWS = this.endToken.beforeWS;
        return null;
        
      default:
        if (token == EOF)
          if (this.startToken != BOF)
            throw "No matching token for " + this.startToken.debug();
          else
            return null;

        this.ignoreIndent = false;
        return token;
    }
  }
};

/**
 * Build AST
 */

Token.prototype.getBaseSpecificity = function(left)
{
  return 100;
};
Token.prototype.getLeftSpecificity = function()
{
  return this.getBaseSpecificity();
};
Token.prototype.getRightSpecificity = function()
{
  return this.getBaseSpecificity();
};
SeparatorToken.prototype.getBaseSpecificity = function()
{
  return 0;
};
OperatorToken.prototype.getBaseSpecificity = function()
{
  return {
    '.':1000,
    '*':120, '/':120, '+':110, '-':110, ',':60,
    '==':50, '!=':50, '>':50, '<':50, '>=':50, '<=':50, 
    '=>': 20, '->': 20,
    '=':10, ',=':10, '::':10
  }[this.value] || 200;
};
OperatorToken.prototype.getRightSpecificity = function()
{
  return this.getBaseSpecificity() - ({
    '->':1, '=>':1
  }[this.value] || 0);
};
NestedTokenStream.prototype.getLeftSpecificity = function()
{
  return 500;
};
NestedTokenStream.prototype.getRightSpecificity = function()
{
  return 100;
};

IdentifierToken.prototype.getExpressionAtValuePosition = 
TokenToken.prototype.getExpressionAtValuePosition = 
NumberToken.prototype.getExpressionAtValuePosition = 
StringToken.prototype.getExpressionAtValuePosition = function(ts)
{
  return expression(this);
};
OperatorToken.prototype.getExpressionAtValuePosition = function(ts)
{
  if (this.value == ",")
    return false;
  var args = ts.parseExpression(900);
  if (!args) // F.e. (+)
    return expression(this);
  else
    return expression(expression(this), args);
};
NestedTokenStream.prototype.getExpressionAtValuePosition = function(ts)
{
  return expression(expression(this.startToken), expression(this));
};

OperatorToken.prototype.getExpressionAtInfixPosition = 
IdentifierToken.prototype.getExpressionAtInfixPosition = function(ts, value)
{
  var args = ts.parseExpression(this.getRightSpecificity());
  if (!args)
    throw "Missing right argument for " + this.debug();
  return expression(expression(this), value, args);
};
NestedTokenStream.prototype.getExpressionAtInfixPosition = function(ts, value)
{
  var op = expression(expression(this.startToken), expression(this));
  var args = ts.parseExpression(this.getRightSpecificity());
  if (!args)
    throw "Missing right argument for " + this.startToken.debug();
  return expression(op, value, args);
};

OperatorToken.prototype.getExpressionAtPostfixPosition = 
IdentifierToken.prototype.getExpressionAtPostfixPosition = function(ts, value)
{
  return expression(expression(this), value);
};
NestedTokenStream.prototype.getExpressionAtPostfixPosition = function(ts, value)
{
  return expression(expression(this.startToken), value, expression(this));
};


NestedTokenStream.prototype.parseExpression = function(precedence)
{
  precedence = precedence || 0;
  
  var token = this.next();
  if (!token || !token.getExpressionAtValuePosition)
  {
    this.pushBack();
    return false;
  }

  var value = token.getExpressionAtValuePosition(this);
  if (!value)
  {
    this.pushBack();
    return false;
  }
    
  // expression now has a value
  while (true) 
  {
    token = this.next();
    if (!token)
    {
      this.pushBack();
      return value;
    }

    if (token.afterWS || token.value == "," || token.value == ".")
    {
      if (!token.getExpressionAtInfixPosition || precedence >= token.getLeftSpecificity())
      {
        this.pushBack();
        return value;
      }
      value = token.getExpressionAtInfixPosition(this, value);
    }
    else
    {
      if (!token.getExpressionAtPostfixPosition)
      {
        this.pushBack();
        return value;
      }
      value = token.getExpressionAtPostfixPosition(this, value);
    }
  }
};


function ExprStream(tokens)
{
  this.tokens = tokens;
}
ExprStream.prototype.next = function()
{
  while (this.tokens.next() instanceof SeparatorToken)
    this.separatorNeeded = false;

  this.tokens.pushBack();
  
  if (this.separatorNeeded)
  {
    var token = this.tokens.peek();
    if (token)
      throw "Unexpected token: " + token.debug();
    else
      return null;
  }
    
  var expr = this.tokens.parseExpression();
  if (!expr)
  {
    var token = this.tokens.peek();
    if (token)
      throw "Unexpected token: " + token.debug();
    else
      return null;
  }
  
  this.separatorNeeded = true;
  return expr;
};
ExprStream.prototype.toJoinExpr = function()
{
  var a = [];
  for (var expr; expr = this.next();)
    a.push(expr);
  return new JoinExpr(a);
};
ExprStream.prototype.toMoiellSource = function()
{
  var a = [];
  for (var expr; expr = this.next();)
    a.push(expr.toMoiellSource());
  return "(" + a.join(";") + ")";
};


/**
 * Serialize functions
 */

Token.prototype.toMoiellSource = function()
{
  return "?" + this.value;
};
Array.prototype.toMoiellSource = function()
{
  /*if (this.length == 1)
    return this[0].toMoiellSource();*/
    
  var a = [];
  for (var i = 0; i < this.length; i++)
    a.push(this[i].toMoiellSource());
  return "(" + a.join(";") + ")";
}
NestedTokenStream.prototype.toMoiellSource = function()
{
  if (!this.startToken)
    return "broken NestedTokenStream";
  var a = [this.startToken.toMoiellSource()];
  for (var token = this.next(); token; token = this.next())
    a.push(token.toMoiellSource());
  a.push(this.endToken.toMoiellSource());
  return a.join("");
};

String.prototype.toMoiellSource = function()
{
  return '"' + this + '"';
};
Number.prototype.toMoiellSource = function()
{
  return "" + this;
};
Object.prototype.toMoiellSource = function()
{
  return "#" + this;
};
