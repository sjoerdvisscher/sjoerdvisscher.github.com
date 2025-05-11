function Token(type, value, line)
{
	this.type = type;
	this.value = value;
	this.line = line;
}
Token.prototype.toString = function() {return this.type+(this.type!=this.value?'('+this.value+')':'')}

function tokenize(source) {
	var matches = [
		{match:/^\n[ \t\r]*\/\/[^\n]*/, type:'NO_TOKEN'},
		{match:/^\/\*([^*]*\*)*[^*]*\*\//, type:'NO_TOKEN'},
		{match:/^\n[ \t\r]*/, type:'INDENTATION'},
		{match:/^[ \t\r]+/, type:'NO_TOKEN'},
		{match:/^;/, type:'separator'},
		{match:/^[\[\]\{\}\(\)\<\>\#\$\.\\]/},
		{match:/^[1-9]\d*(\.\d+)?/, type:'number'},
		{match:/^0/, type:'number'},
		{match:/^[A-Za-z_][A-Za-z0-9_]*/, type:'ident'},
		{match:/^(\=\=|\!\=)/, type:'operator'},
		{match:/^[\*\/\+\-\&\^\?\!\|\:\,\@]+/, type:'operator'},
		{match:/^[\=]/},
		{match:/^\'([^\'\\]*\\.)*[^\'\\]*\'/, type:'string'},
		{match:/^\"([^\"\\]*\\.)*[^\"\\]*\"/, type:'string'}
	];
	var tokens=[];
	var line=1;
	var prevToken={};
	var curIndentLen=0; 
	var exprIndentLen=0;
	var exprIndentLens=[];
	var firstTokenAfterSep=true;
	source = '\n'+source;
	while (source)
	{
		var oldLength = source.length;
		for (var i=0;i<matches.length;i++)
		{
			var m = source.match(matches[i].match);
			if (m)
			{
				var value = m[0];
				var type = matches[i].type || value;
				if (type=='INDENTATION') {
					line++;
					curIndentLen = value.length;
					type=curIndentLen>exprIndentLen?'NO_TOKEN':'separator';
				}
				if (type=='separator'&&firstTokenAfterSep) type='NO_TOKEN';
				if (')}]>'.indexOf(value)!=-1) {
					exprIndentLen=exprIndentLens.pop();
					firstTokenAfterSep=false;
				}
				if (type!='NO_TOKEN') {
					if (type!='separator') {
						if (firstTokenAfterSep) {
						  firstTokenAfterSep = false;
						  exprIndentLen = curIndentLen;
						}
					} else firstTokenAfterSep=true;
					prevToken = new Token(type, value, line);
					tokens.push(prevToken);
				}
				if ('({[<'.indexOf(value)!=-1) {
					firstTokenAfterSep=true;
					exprIndentLens.push(exprIndentLen);
					curIndentLen=exprIndentLen=Infinity;
				}

				source = source.substr(value.length);
				break;
			}
		}
		if (source.length == oldLength) {
			alert('remaining source:' + source);
			return tokens;
		}
	}
	return tokens;
}

var scope=new OP(OP.SCOPE);
scope.toString=function(){return '$'}

OP.prototype.toString=function() {
	switch (this.method) {
		case OP.GET: return this.object+'.'+(typeof(this.arg1)=='string'?this.arg1:'('+this.arg1+')');
		case OP.GETVAR: return this.arg1=='.'?'':this.arg1;
		case OP.SET: return this.object+'.'+(typeof(this.arg1)=='string'?this.arg1:'('+this.arg1+')')+'='+this.arg2;
		case OP.SETVAR: return this.arg1+'='+this.arg2;
		case OP.NEW: return this.object+'&lt;<div>'+this.arg1+'</div>&gt;';
		case OP.EXPR: return '{<div>'+this.object+'</div>}';
		case OP.EVAL: return (this.arg1||'')+'#'+this.object;
		case OP.LIST: return '[<div>'+this.object+'</div>]';
		case OP.APPLY: return '('+this.object+' '+this.arg1+' '+this.arg2+')';
		case OP.APPSET: return '('+this.object+' '+this.arg1+'= '+this.arg2+')';
	}
}

function Parser() {}
Parser.prototype={
	parse:function(tokens) {
		this.pos = 0;
		this.tokens = tokens.concat([new Token('_END',null)]);
		var value = this.exprs();
		if (this.tokens[this.pos].type!='_END') {
			if (this.tokens[this.pos-1].line<this.tokens[this.pos].line) this.error('Unexpected token. Probably a missing ";" at line '+this.tokens[this.pos-1].line);
			else this.error('Unexpected token');
		}
		return value;
	},
	error:function(message) {
		var token = this.tokens[this.pos];
		alert('error: '+message + '\nline: '+token.line+' token: ' + token.type);
		throw message;
	},
	exprs:function() {
		var result = NEW(_CP);
		var list = result;
		while (true) {
			var value = this.expr();
			if (value == LoellFailure) return result;
			list.hd = value;
			list = list.tl = NEW(_CP);
			var token = this.tokens[this.pos];
			if (token.type == 'separator') this.pos++;
			else return result;
		}
	},
	expr:function(precedence, required) {
		precedence = precedence || 0;
		var token = this.tokens[this.pos];
		var value;
		switch (token.type) {
			case '$':	
				value = scope;
				this.pos++;
				break;
			case 'ident':
				value = new OP(OP.GETVAR, scope, token.value);
				this.pos++;
				break;
			case 'operator':
				var mName = token.value;
				this.pos++;
				value = new OP(OP.APPLY, this.expr(1000), mName, LoellFailure);
				break;
			case 'string':
				value = new LoellString(eval(token.value));
				this.pos++;
				break;
			case 'number':
				value = new LoellNumber(eval(token.value));
				this.pos++;
				break;
			case '{':
				this.pos++;
				token = this.tokens[this.pos];
				value = new OP(OP.EXPR, this.exprs())
				token = this.tokens[this.pos];
				if (token.type != '}') this.error('"}" expected');
				this.pos++;
				break;
			case '\\':
				this.pos++;
				token = this.tokens[this.pos];
				var argName = token.value;
				token.value = 'that';
				value = new OP(OP.SET, scope, argName, this.expr());
				break;
			case '[':
				this.pos++;
				value = new OP(OP.LIST, this.exprs())
				token = this.tokens[this.pos];
				if (token.type != ']') this.error('"]" expected');
				this.pos++;
				break;
			case '(':
				this.pos++;
				value = this.exprs();
				token = this.tokens[this.pos];
				if (token.type != ')') this.error('")" expected');
				this.pos++;
				break;
				
			// default left values for built-in binary operators
			case '.':
				value = new OP(OP.GETVAR, scope, '.');
				break;
			case '<':
				value = new OP(OP.GETVAR, scope, 'Any');
				break;
			case '#':
				value = null;
				break;
				
			// if a value is required, drop the separator
			case 'separator':
				if (!required) return LoellFailure;
				this.pos++;
				return this.expr(precedence, required);
				
			// end of expression for other tokens
			default:
				return LoellFailure;
		}
		
		if (precedence >= 1000) return value;
		
		// expression now has a value
		while (true) {
			var token = this.tokens[this.pos];
			switch (token.type) {
				case '=':
					switch (value.method) {
						case OP.GET:
							value.method = OP.SET;
							break;
					  case OP.GETVAR:
							value.method = OP.SETVAR;
							break;
						default:
							this.error('Cannot assign to '+value);
					}
					this.pos++;
					value.arg2 = this.expr(0, true);
					break;
				case '#':
					this.pos++;
					value = new OP(OP.EVAL, this.expr(0, true), value);
					break;
				case '.':
					this.pos++; token = this.tokens[this.pos];
					if (token.value == '(') {
						this.pos++;
						value = new OP(OP.GET, value, this.exprs());
						token = this.tokens[this.pos];
						if (token.value != ')') this.error('")" expected');
					} else	value = new OP(OP.GET, value, token.value);
					this.pos++;
					break;
				case '<':
					this.pos++;
					value = new OP(OP.NEW, value, this.exprs());
					token = this.tokens[this.pos];
					if (token.type != '>') this.error('">" expected');
					this.pos++;
					break;

				case 'ident':
				case 'operator':
					var mName = token.value;
					var opPrec = this.precedenceTable[mName] || (token.type=='ident'?200:100);
					if (precedence >= opPrec) return value;
					this.pos++;
					if (this.tokens[this.pos].value=='=') {
						this.pos++;
						switch (value.method) {
							case OP.GETVAR:
								value = new OP(OP.SETVAR, scope, value.arg1, 
									new OP(OP.APPLY, value, mName, this.expr(0, true)));
								break;
							case OP.GET:
								value = new OP(OP.APPSET, value, mName, this.expr(0, true));
								break;
							default:
								this.error('Cannot assign to '+value);
						}
					} else {
						value = new OP(OP.APPLY, value, mName, this.expr(opPrec));
					}
					break;
				case '[':
					if (precedence >= 100) return value;
					this.pos++;
					value = new OP(OP.APPLY, value, 'filter',  new OP(OP.EXPR, this.exprs()));
					token = this.tokens[this.pos];
					if (token.type != ']') this.error('"]" expected');
					this.pos++;
					break;
				case '(':
				case '{':
					if (precedence >= 80) return value;
					value = new OP(OP.APPLY, value, this.expr(1000), this.expr(80));
					break;

				// end of expression for other tokens
				default:
					return value;
			}
		}
	},
	precedenceTable:{
		'+':110, '-':110, '*':120, '/':120, '==':50, '!=':50
	}
}