<?xml version="1.0"?>
<xsl:stylesheet version="1.0" exclude-result-prefixes="xqx xsi"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xslt="http://www.w3.org/1999/XSL/TransformAlt"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xqx="http://www.w3.org/2003/12/XQueryX">

  <xsl:namespace-alias stylesheet-prefix="xslt" result-prefix="xsl"/>
  
  <xsl:output method="xml" indent="yes" />
  <xsl:strip-space elements="*"/>

  <xsl:variable name="DOT">.</xsl:variable>
  <xsl:variable name="SPACE"><xsl:text> </xsl:text></xsl:variable>
  <xsl:variable name="SLASH"><xsl:text>/</xsl:text></xsl:variable>
  <xsl:variable name="SLASH_SLASH"><xsl:text>//</xsl:text></xsl:variable>
  <xsl:variable name="LESSTHAN"><xsl:text>&lt;</xsl:text></xsl:variable>
  <xsl:variable name="GREATERTHAN"><xsl:text>&gt;</xsl:text></xsl:variable>
  <xsl:variable name="LPAREN">(</xsl:variable>
  <xsl:variable name="RPAREN">)</xsl:variable>
  <xsl:variable name="NEWLINE"><xsl:text>
</xsl:text></xsl:variable>
  <xsl:variable name="COMMA">,</xsl:variable>
  <xsl:variable name="COMMA_SPACE">, </xsl:variable>
  <xsl:variable name="COMMA_NEWLINE"><xsl:text>,
</xsl:text></xsl:variable>
  <xsl:variable name="QUOTE"><xsl:text>'</xsl:text></xsl:variable>
  <xsl:variable name="DOUBLEQUOTE"><xsl:text>"</xsl:text></xsl:variable>
  <xsl:variable name="TRUE"><xsl:text>true</xsl:text></xsl:variable>
  <xsl:variable name="TO"><xsl:text> to </xsl:text></xsl:variable>
  <xsl:variable name="LBRACE"><xsl:text>{</xsl:text></xsl:variable>
  <xsl:variable name="RBRACE"><xsl:text>}</xsl:text></xsl:variable>
  <xsl:variable name="LBRACKET"><xsl:text>[</xsl:text></xsl:variable>
  <xsl:variable name="RBRACKET"><xsl:text>]</xsl:text></xsl:variable>
  <xsl:variable name="DOLLAR"><xsl:text>$</xsl:text></xsl:variable>
  <xsl:variable name="MINUS"><xsl:text>-</xsl:text></xsl:variable>
  <xsl:variable name="PLUS"><xsl:text>+</xsl:text></xsl:variable>
  <xsl:variable name="EQUAL"><xsl:text>=</xsl:text></xsl:variable>
  <xsl:variable name="COLON"><xsl:text>:</xsl:text></xsl:variable>
  <xsl:variable name="DOUBLE_COLON"><xsl:text>::</xsl:text></xsl:variable>
  <xsl:variable name="SEMICOLON"><xsl:text>;</xsl:text></xsl:variable>
  <xsl:variable name="AT"><xsl:text>@</xsl:text></xsl:variable>

  <xsl:template name="delimitedList">
    <xsl:param name="delimiter" />
    <xsl:param name="leftEncloser"/>
    <xsl:param name="rightEncloser" />
    <xsl:param name="selector"></xsl:param>
    <xsl:value-of select="$leftEncloser"/>
    <xsl:for-each select="*">
      <xsl:apply-templates select="." mode="path" />
      <xsl:if test="not (position()=last())">         <xsl:value-of select="$delimiter"/>
      </xsl:if>        </xsl:for-each>
    <xsl:value-of select="$rightEncloser"/>
  </xsl:template>    
  <xsl:template name="paranthesizedList">
    <xsl:param name="delimiter" select="$COMMA_SPACE"/>
    <xsl:call-template name="delimitedList">
      <xsl:with-param name="delimiter" select="$delimiter" />
      <xsl:with-param name="leftEncloser" select="$LPAREN"/>
      <xsl:with-param name="rightEncloser" select="$RPAREN"/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="commaSeparatedList">
    <xsl:call-template name="delimitedList">
      <xsl:with-param name="delimiter">
        <xsl:value-of select="$COMMA_SPACE"/>
      </xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="quote">
    <xsl:param name="item"/>
    <xsl:value-of select="$DOUBLEQUOTE"/>
    <xsl:value-of select="$item"/>
    <xsl:value-of select="$DOUBLEQUOTE"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:stringConstantExpr']">
    <xsl:call-template name="quote">
      <xsl:with-param name="item" select="xqx:value/text()"/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:integerConstantExpr'
      or @xsi:type='xqx:decimalConstantExpr' 
      or xqx:type='xsd:doubleConstantExpr']">
    <xsl:value-of select="xqx:value/text()"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:functionCallExpr']">
    <xsl:value-of select="xqx:functionName/text()"/>
    <xsl:for-each select="xqx:parameters">
      <xsl:call-template name="paranthesizedList"/>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="xqx:opType">
    <xsl:choose>
      <xsl:when test="./text() = 'unaryMinus'">
        <xsl:value-of select="$MINUS"/>
      </xsl:when>
      <xsl:when test="./text() = 'unaryPlus'">
        <xsl:value-of select="$PLUS"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="./text()"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:operatorExpr']">
    <xsl:variable name="operator">
      <xsl:text> </xsl:text>
      <xsl:apply-templates select="xqx:opType"/>
      <xsl:text> </xsl:text>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="xqx:infixOp">
        <xsl:for-each select="xqx:parameters">
          <xsl:call-template name="paranthesizedList">
            <xsl:with-param name="delimiter" select="$operator"/>
          </xsl:call-template>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="xqx:opType"/>
        <xsl:for-each select="xqx:parameters">
          <xsl:call-template name="paranthesizedList"/>
        </xsl:for-each>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:sequenceExpr']">
    <xsl:apply-templates select="*" />
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:rangeSequenceExpr']">
    <xsl:value-of select="$LPAREN"/>
    <xsl:apply-templates select="./*[1]"/>
    <xsl:value-of select="$TO"/>
    <xsl:apply-templates select="./*[2]"/>
    <xsl:value-of select="$RPAREN"/>
  </xsl:template>

  <xsl:template match="xqx:forClause">
    <xsl:apply-templates select="xqx:forClauseItem[1]" />
  </xsl:template>

  <xsl:template match="xqx:forClauseItem">
    <xslt:for-each>
      <xsl:attribute name="select"><xsl:apply-templates select="xqx:forExpr/*" mode="path" /></xsl:attribute>
      <xslt:variable select="current()">
        <xsl:apply-templates select="xqx:typedVariableBinding"/>
      </xslt:variable>
      <xsl:apply-templates select="xqx:positionalVariableBinding"/>
      <xsl:apply-templates select="../../xqx:orderByClause/xqx:orderBySpec[xqx:orderByExpr/xqx:expr[@xsi:type='xqx:pathExpr']/xqx:expr[@xsi:type='xqx:variable']/xqx:name = current()/xqx:typedVariableBinding/xqx:varName]" />
      <xsl:apply-templates select="following::*[1]" />
    </xslt:for-each>    
  </xsl:template>

  <xsl:template match="xqx:letClauseItem">
    <xslt:variable>
      <xsl:apply-templates select="xqx:typedVariableBinding"/>
      <xsl:apply-templates select="xqx:letExpr/*"/>
    </xslt:variable>
    <xsl:apply-templates select="following::*[1]" />
  </xsl:template>

  <xsl:template match="xqx:letClause">
    <xsl:apply-templates select="xqx:letClauseItem[1]" />
  </xsl:template>

  <xsl:template match="xqx:returnClause">
    <xsl:apply-templates select="*"/>
  </xsl:template>

  <xsl:template match="xqx:whereClause">
    <xslt:if>
      <xsl:attribute name="test"><xsl:apply-templates select="*" mode="path"/></xsl:attribute>
      <xsl:apply-templates select="following::*[1]" />
    </xslt:if>
  </xsl:template>

  <xsl:template match="xqx:collation">
    <xsl:text> collation </xsl:text>
    <xsl:value-of select="text()"/>
  </xsl:template>

  <xsl:template match="xqx:orderModifier">
    <xsl:for-each select="*">
      <xsl:choose>
        <xsl:when test="name()='ascending'">
          <xsl:attribute name="order">ascending</xsl:attribute>
        </xsl:when>
        <xsl:when test="name()='descending'">
          <xsl:attribute name="order">descending</xsl:attribute>
        </xsl:when>
        <xsl:when test="name()='emptyGreatest'">
        </xsl:when>
        <xsl:when test="name()='emptyLeast'">
        </xsl:when>
        <xsl:when test="name()='collation'">
          <xsl:attribute name="collation"><xsl:value-of select="."/></xsl:attribute>
        </xsl:when>
      </xsl:choose>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="xqx:orderBySpec">
    <xslt:sort>
      <xsl:attribute name="select">
        <xsl:apply-templates select="xqx:orderByExpr/xqx:expr" mode="path"/>
      </xsl:attribute>
      <xsl:apply-templates select="xqx:orderModifier"/>
    </xslt:sort>
  </xsl:template>

  <xsl:template match="xqx:orderByClause">
    <xsl:apply-templates select="following::*[1]" />
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:flworExpr']">
    <xsl:apply-templates select="xqx:forClause"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:ifThenElseExpr']">
    <xslt:choose>
      <xslt:when>
        <xsl:apply-templates select="xqx:ifClause/*"/>
        <xsl:apply-templates select="xqx:thenClause/*"/>
      </xslt:when>
      <xslt:otherwise>
        <xsl:apply-templates select="xqx:elseClause/*"/>
      </xslt:otherwise>
    </xslt:choose>
  </xsl:template>

  <xsl:template match="xqx:positionalVariableBinding">
    <xslt:variable select="position()">
      <xsl:attribute name="name"><xsl:value-of select="./text()" /></xsl:attribute>
    </xslt:variable>    
  </xsl:template>

  <xsl:template name="xqx:variableBinding">
    <xsl:attribute name="name"><xsl:value-of select="./text()" /></xsl:attribute>
  </xsl:template>
  
  <xsl:template match="xqx:typedVariableBinding">
    <xsl:attribute name="name"><xsl:value-of select="xqx:varName" /></xsl:attribute>
    <xsl:if test="xqx:typeDeclaration">
      <xsl:attribute name="as">
        <xsl:apply-templates select="xqx:typeDeclaration"/>
      </xsl:attribute>
    </xsl:if>
  </xsl:template>

  <xsl:template match="xqx:quantifiedExprInClause">
    <xsl:apply-templates select="xqx:typedVariableBinding"/>
    <xsl:text> in </xsl:text>
    <xsl:apply-templates select="xqx:qExpr/*"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:quantifiedExpr']">
    <xsl:value-of select="xqx:quantifier"/>
    <xsl:value-of select="$SPACE"/>
    <xsl:apply-templates select="xqx:quantifiedExprInClause[1]"/>
    <xsl:for-each select="xqx:quantifiedExprInClause[position() > 1]">
      <xsl:value-of select="$COMMA_SPACE"/>
      <xsl:apply-templates select="."/>
    </xsl:for-each>
    <xsl:text> satisfies </xsl:text>
    <xsl:apply-templates select="xqx:satisfiesExpr/*"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:instanceOfExpr']">
    <xsl:value-of select="$LPAREN"/>
    <xsl:apply-templates select="xqx:treatExpr/*"/>
    <xsl:text> instance of </xsl:text>
    <xsl:apply-templates select="xqx:sequenceType"/>
    <xsl:value-of select="$RPAREN"/>
  </xsl:template>

  <xsl:template match="xqx:singleType">
    <xsl:apply-templates select="xqx:atomicType"/>
    <xsl:if test="xqx:optional">
      <xsl:text>?</xsl:text>
    </xsl:if>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:castExpr']">
    <xsl:value-of select="$LPAREN"/>
    <xsl:apply-templates select="xqx:expr"/>
    <xsl:text> cast as </xsl:text>
    <xsl:apply-templates select="xqx:singleType"/>
    <xsl:value-of select="$RPAREN"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:castableExpr']">
    <xsl:value-of select="$LPAREN"/>
    <xsl:apply-templates select="xqx:expr"/>
    <xsl:text> castable as </xsl:text>
    <xsl:apply-templates select="xqx:singleType"/>
    <xsl:value-of select="$RPAREN"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:treatExpr']">
    <xsl:value-of select="$LPAREN"/>
    <xsl:apply-templates select="xqx:expr"/>
    <xsl:text> treat as </xsl:text>
    <xsl:apply-templates select="xqx:sequenceType"/>
    <xsl:value-of select="$RPAREN"/>
  </xsl:template>
    <xsl:template match="xqx:typeswitchExprCaseClause">
    <xsl:text> case </xsl:text>
    <xsl:apply-templates select="xqx:variableBinding"/>
    <xsl:apply-templates select="xqx:typeDeclaration"/>
    <xsl:text> return </xsl:text>
    <xsl:apply-templates select="xqx:returnExpr/*"/>
  </xsl:template>

  <xsl:template match="xqx:typeswitchExprDefaultClause">
    <xsl:text> default </xsl:text>
    <xsl:apply-templates select="xqx:variableBinding"/>
    <xsl:text> return </xsl:text>
    <xsl:apply-templates select="xqx:returnExpr/*"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:typeswitchExpr']">
    <xsl:value-of select="$LPAREN"/>
    <xsl:text>(typeswitch(</xsl:text>
    <xsl:apply-templates select="xqx:treatExpr/*"/>
    <xsl:value-of select="$RPAREN"/>
    <xsl:apply-templates select="xqx:typeswitchExprCaseClause"/>
    <xsl:apply-templates select="xqx:typeswitchExprDefaultClause"/>
    <xsl:value-of select="$RPAREN"/>
  </xsl:template>

  <xsl:template match="xqx:QName">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template match="xqx:NCName">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template name="QName_Path">
    <xsl:call-template name="delimitedList">
      <xsl:with-param name="delimiter" select="$SLASH"/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="xqx:schemaContextLocation">
    <xsl:text> context </xsl:text>
    <xsl:choose>
      <xsl:when test="xqx:type">
        <xsl:text> type (</xsl:text>
        <xsl:apply-templates select="xqx:QName[1]"/>
        <xsl:value-of select="$RPAREN"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="xqx:QName[1]"/>
      </xsl:otherwise>
    </xsl:choose>
    <xsl:for-each select="xqx:QName[position() > 1]">       
      <xsl:value-of select="$SLASH"/>
      <xsl:apply-templates select="."/>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="xqx:validatonContext">
    <xsl:value-of select="xqx:validationMode"/>
    <xsl:if test="xqx:globalValidationContext">
      <xsl:text> global </xsl:text>
    </xsl:if>
    <xsl:apply-templates select="xqx:schemaContextLocation"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:validateExpr']">
    <xsl:text> validate </xsl:text>
    <xsl:apply-templates select="xqx:validationContext"/>
    <xsl:value-of select="$LBRACE"/>
    <xsl:apply-templates select="xqx:exprWrapper/*"/>
    <xsl:value-of select="$RBRACE"/>
  </xsl:template>

  <xsl:template match="xqx:xpathAxis">
    <xsl:value-of select="."/>
    <xsl:value-of select="$DOUBLE_COLON"/>
  </xsl:template>

  <xsl:template match="xqx:xpathAxis[.='descendant-or-self']">
    <xsl:value-of select="$SLASH"/>
  </xsl:template>

  <xsl:template match="xqx:xpathAxis[.='child']">
  </xsl:template>

  <xsl:template match="xqx:predicates">
    <xsl:for-each select="*">
      <xsl:value-of select="$LBRACKET"/>
      <xsl:apply-templates select="."/>
      <xsl:value-of select="$RBRACKET"/>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="xqx:star">
    <xsl:text>*</xsl:text>
  </xsl:template>

  <xsl:template match="xqx:Wildcard">
    <xsl:call-template name="delimitedList">
      <xsl:with-param name="delimiter" select="$COLON"/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="xqx:textTest">
    <xsl:text>text()</xsl:text>
  </xsl:template>
  <xsl:template match="xqx:commentTest">
    <xsl:text>comment()</xsl:text>
  </xsl:template>
  <xsl:template match="xqx:anyKindTest">
    <xsl:text>node()</xsl:text>
  </xsl:template>
  <xsl:template match="xqx:piTest">
    <xsl:text>processing-instruction(</xsl:text>
    <xsl:value-of select="."/>
    <xsl:value-of select="$RPAREN"/>
  </xsl:template>
  <xsl:template match="xqx:documentTest">
    <xsl:text>document-node(</xsl:text>
    <xsl:apply-templates select="*"/>
    <xsl:value-of select="$RPAREN"/>
  </xsl:template>

  <xsl:template match="xqx:attributeTest">
    <xsl:text>attribute(</xsl:text>
    <xsl:choose>
      <xsl:when test="xqx:schemaContextLocation">
        <xsl:apply-templates select="xqx:schemaContextLocation"/>
        <xsl:value-of select="$COMMA"/>
        <xsl:apply-templates select="xqx:QName"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$AT"/>
        <xsl:value-of select="xqx:nodeName"/>
        <xsl:if test="xqx:typeName">
          <xsl:value-of select="$COMMA"/>
          <xsl:value-of select="xqx:typeName"/>
        </xsl:if>
      </xsl:otherwise>
    </xsl:choose>
    <xsl:value-of select="$RPAREN"/>
  </xsl:template>

  <xsl:template match="xqx:attributeTest[xqx:nodeName][not(xqx:typeName)]">
    <xsl:value-of select="$AT" />
    <xsl:value-of select="xqx:nodeName"/>
  </xsl:template>
  
  <xsl:template match="xqx:elementTest">
    <xsl:text>element(</xsl:text>
    <xsl:choose>
      <xsl:when test="xqx:schemaContextLocation">
        <xsl:apply-templates select="xqx:schemaContextLocation"/>
        <xsl:value-of select="$COMMA"/>
        <xsl:apply-templates select="xqx:QName"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="xqx:nodeName"/>
        <xsl:if test="xqx:typeName">
          <xsl:value-of select="$COMMA"/>
          <xsl:value-of select="xqx:typeName"/>
          <xsl:if test="xqx:nillable">
            <xsl:text> nillable </xsl:text>
          </xsl:if>
        </xsl:if>
      </xsl:otherwise>
    </xsl:choose>
    <xsl:value-of select="$RPAREN"/>
  </xsl:template>
  
  <xsl:template match="xqx:elementTest[xqx:nodeName][not(xqx:typeName|xqx:nillable)]">
    <xsl:value-of select="xqx:nodeName"/>
  </xsl:template>
  
  <xsl:template match="xqx:stepExpr">
    <xsl:value-of select="$SLASH"/>
    <xsl:apply-templates select="*"/>
  </xsl:template>

  <xsl:template match="xqx:stepExpr[xqx:xpathAxis='self'][xqx:attributeTest]">
    <xsl:value-of select="$SLASH"/>
    <xsl:apply-templates select="xqx:attributeTest"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:pathExpr' or @xsi:type='xqx:variable' or @xsi:type='xqx:contextItemExpr' or @xsi:type='xqx:rootExpr']">
    <xslt:apply-templates>
      <xsl:attribute name="select">
        <xsl:apply-templates select="." mode="path" />
      </xsl:attribute>
    </xslt:apply-templates>
  </xsl:template>

  <xsl:template match="xqx:expr" mode="path">
    <xsl:apply-templates select="." />
  </xsl:template>
  
  <xsl:template match="xqx:expr[@xsi:type='xqx:rootExpr']" mode="path">
    <xsl:value-of select="$SLASH"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:contextItemExpr']" mode="path">
    <xsl:value-of select="$DOT"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:pathExpr']" mode="path">
    <xsl:choose>
      <xsl:when test="xqx:expr">
        <xsl:apply-templates select="xqx:expr" mode="path" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$DOT"/>
      </xsl:otherwise>
    </xsl:choose>
    <xsl:apply-templates select="xqx:predicates"/>
    <xsl:apply-templates select="xqx:stepExpr"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:variable']" mode="path">
    <xsl:value-of select="$DOLLAR" />
    <xsl:value-of select="xqx:name/text()" />
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:attributeConstructor']">
    <xslt:attribute name="{xqx:attributeName}">
      <xsl:apply-templates select="xqx:attributeValue/xqx:expr"/>
    </xslt:attribute>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:commentConstructor']">
    <xsl:text>&lt;!--</xsl:text>
    <xsl:value-of select="comment"/>
    <xsl:text>--&gt;</xsl:text>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:piConstructor']">
    <xsl:text>&lt;?</xsl:text>
    <xsl:value-of select="piTarget"/>
    <xsl:value-of select="$SPACE"/>
    <xsl:value-of select="piValue"/>
    <xsl:value-of select="$SPACE"/>
    <xsl:text>?&gt;</xsl:text>
    <xsl:value-of select="$NEWLINE"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:piConstructor']">
    <xsl:text>&lt;![CDATA["</xsl:text>
    <xsl:value-of select="."/>
    <xsl:text>]]&gt;</xsl:text>
    <xsl:value-of select="$NEWLINE"/>
  </xsl:template>

  <xsl:template match="xqx:elementContent">
    <xsl:apply-templates select="*" />
  </xsl:template>


  <xsl:template match="xqx:expr[@xsi:type='xqx:elementConstructor']">
    <xsl:element name="{xqx:tagName}">
      <xsl:apply-templates select="xqx:attributeList/*"/>
      <xsl:apply-templates select="xqx:elementContent"/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="xqx:tagNameExpr">
    <xsl:value-of select="$LBRACE"/>
    <xsl:apply-templates select="*"/>
    <xsl:value-of select="$RBRACE"/>
  </xsl:template>

  <xsl:template name="tagName">
    <xsl:value-of select="$SPACE"/>
    <xsl:value-of select="."/>
    <xsl:value-of select="$SPACE"/>
  </xsl:template>

  <xsl:template name="tagNameExpr">
    <xsl:value-of select="$LBRACE"/>
    <xsl:apply-templates select="*"/>
    <xsl:value-of select="$RBRACE"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:computedElementConstructor']">
    <xsl:text> element </xsl:text>
    <xsl:apply-templates select="xqx:tagName"/>
    <xsl:apply-templates select="xqx:tagNameExpr"/>
    <xsl:value-of select="$LBRACE"/>
    <xsl:apply-templates select="xqx:contentExpr/*"/>     
    <xsl:value-of select="$RBRACE"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:computedAttributeConstructor']">
    <xsl:text> attribute </xsl:text>
    <xsl:apply-templates select="xqx:tagName"/>
    <xsl:apply-templates select="xqx:tagNameExpr"/>
    <xsl:value-of select="$LBRACE"/>
    <xsl:apply-templates select="xqx:valueExpr/*"/>     
    <xsl:value-of select="$RBRACE"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:computedDocumentConstructor']">
    <xsl:text> document {</xsl:text>
    <xsl:apply-templates select="*"/>
    <xsl:text> }</xsl:text>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:computedTextConstructor']">
    <xsl:text> text {</xsl:text>
    <xsl:apply-templates select="*"/>
    <xsl:text> }</xsl:text>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:computedCommentConstructor']">
    <xsl:text> comment {</xsl:text>
    <xsl:apply-templates select="*"/>
    <xsl:text> }</xsl:text>
  </xsl:template>

  <xsl:template match="xqx:piValueExpr">
    <xsl:value-of select="$LBRACE"/>
    <xsl:apply-templates select="*"/>
    <xsl:value-of select="$RBRACE"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:computedPIConstructor']">
    <xsl:text> processing-instruction </xsl:text>
    <xsl:value-of select="piTarget"/>
    <xsl:apply-templates select="piTargetExpr"/>
    <xsl:value-of select="$LBRACE"/>
    <xsl:apply-templates select="piValueExpr/*"/>
    <xsl:value-of select="$RBRACE"/>
  </xsl:template>
  <xsl:template match="xqx:expr[@xsi:type='xqx:computedNamespaceConstructor']">
    <xsl:text> namespace </xsl:text>
    <xsl:value-of select="prefix/*"/>
    <xsl:value-of select="$SPACE"/>
    <xsl:value-of select="$LBRACE"/>
    <xsl:apply-templates select="uri/*"/>
    <xsl:value-of select="$RBRACE"/>
  </xsl:template>

  <xsl:template match="xqx:expr[@xsi:type='xqx:unorderedExpr']">
    <xsl:text> unordered( </xsl:text>
    <xsl:apply-templates select="*"/>
    <xsl:value-of select="$RPAREN"/>
  </xsl:template>

  <xsl:template match="xqx:version">
    <xsl:text> xquery version </xsl:text>
    <xsl:call-template name="quote">
      <xsl:with-param name="item" select="."/>
    </xsl:call-template>
    <xsl:value-of select="$SEMICOLON"/>
    <xsl:value-of select="$NEWLINE"/>
  </xsl:template>

  <xsl:template match="xqx:namespaceDecl">
    <xsl:text> declare namespace </xsl:text>
    <xsl:value-of select="xqx:prefix"/>
    <xsl:value-of select="$EQUAL"/>
    <xsl:call-template name="quote">
      <xsl:with-param name="item" select="xqx:uri"/>
    </xsl:call-template>
    <xsl:value-of select="$NEWLINE"/>
  </xsl:template>

  <xsl:template match="xqx:defaultNamespaceDecl">
    <xsl:text> default </xsl:text>
    <xsl:value-of select="defaultNamespaceCategory"/>
    <xsl:text> namespace = </xsl:text>
    <xsl:call-template name="quote">
      <xsl:with-param name="item" select="xqx:uri"/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="xqx:defaultCollationDecl">
    <xsl:text> default collation = </xsl:text>
    <xsl:value-of select="."/>        
  </xsl:template>

  <xsl:template match="xqx:baseUriDecl">
    <xsl:text> declare base-uri </xsl:text>
    <xsl:value-of select="."/>        
  </xsl:template>

  <xsl:template match="xqx:xmlspaceDecl">
    <xsl:text> declare xmlspace </xsl:text>
    <xsl:value-of select="$EQUAL"/>
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template match="xqx:emptySequenceType">
    <xsl:text>empty()</xsl:text>
  </xsl:template>

  <xsl:template match="xqx:atomicType">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template match="xqx:occurenceIndicator">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template match="xqx:anyItemType">
    <xsl:text>item()</xsl:text>
  </xsl:template>

  <xsl:template match="xqx:sequenceType">
    <xsl:apply-templates select="*"/>
  </xsl:template>

  <xsl:template match="xqx:typeDeclaration">
    <xsl:text> as </xsl:text>
    <xsl:apply-templates select="*"/>
  </xsl:template>

  <xsl:template match="xqx:varDecl">
    <xsl:text> declare variable </xsl:text>
    <xsl:value-of select="$DOLLAR"/>
    <xsl:value-of select="xqx:varName"/>
    <xsl:value-of select="$SPACE"/>
    <xsl:apply-templates select="xqx:typeDeclaration"/>
    <xsl:if test="xqx:external">
      <xsl:text> external </xsl:text>
    </xsl:if>
    <xsl:if test="xqx:varValue">
      <xsl:value-of select="$LBRACE"/>
      <xsl:apply-templates select="xqx:expr"/>
      <xsl:value-of select="$RBRACE"/>          
    </xsl:if>
  </xsl:template>

  <xsl:template match="xqx:schemaImport">
    <xsl:text> import schema </xsl:text>
    <xsl:if test="xqx:defaultElementNamespace">
      <xsl:text> default element namespace = </xsl:text>
    </xsl:if>
    <xsl:if test="xqx:namespacePrefix">
      <xsl:text> namespace </xsl:text>
      <xsl:value-of select="xqx:namespacePrefix"/>
      <xsl:value-of select="$EQUAL"/>
    </xsl:if>
    <xsl:call-template name="quote">
      <xsl:with-param name="item" select="xqx:targetNamespace"/>
    </xsl:call-template>
    <xsl:if test="xqx:targetLocation">
      <xsl:text> at </xsl:text>
      <xsl:call-template name="quote">
        <xsl:with-param name="item" select="xqx:targetLocation"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <xsl:template match="xqx:moduleImport">
    <xsl:text> import module </xsl:text>
    <xsl:if test="xqx:namespacePrefix">
      <xsl:text> namespace </xsl:text>
      <xsl:value-of select="xqx:namespacePrefix"/>
      <xsl:value-of select="$EQUAL"/>
    </xsl:if>
    <xsl:call-template name="quote">
      <xsl:with-param name="item" select="xqx:targetNamespace"/>
    </xsl:call-template>
    <xsl:if test="xqx:targetLocation">
      <xsl:text> at </xsl:text>
      <xsl:call-template name="quote">
        <xsl:with-param name="item" select="xqx:targetLocation"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <xsl:template match="xqx:validationDecl">
    <xsl:text> declare validation </xsl:text>
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template match="xqx:param">
    <xsl:value-of select="$DOLLAR"/>
    <xsl:value-of select="xqx:varName"/>
    <xsl:apply-templates select="xqx:typeDeclaration"/>
  </xsl:template>

  <xsl:template match="xqx:paramList">
    <xsl:call-template name="paranthesizedList"/>
  </xsl:template>

  <xsl:template match="xqx:functionBody">
    <xsl:value-of select="$NEWLINE"/>
    <xsl:value-of select="$LBRACE"/>
    <xsl:value-of select="$NEWLINE"/>
    <xsl:apply-templates select="xqx:expr"/>
    <xsl:value-of select="$NEWLINE"/>
    <xsl:value-of select="$RBRACE"/>
  </xsl:template>

  <xsl:template match="xqx:functionDecl">
    <xsl:text> declare function </xsl:text>
    <xsl:value-of select="xqx:functionName"/>
    <xsl:apply-templates select="xqx:paramList"/>
    <xsl:apply-templates select="xqx:typeDeclaration"/>
    <xsl:apply-templates select="xqx:functionBody"/>
    <xsl:if test="xqx:externalDefinition">
      <xsl:text> external </xsl:text>
    </xsl:if>
  </xsl:template>

  <xsl:template match="xqx:queryBody">
    <xsl:apply-templates select="*"/>
    <xsl:value-of select="$NEWLINE"/>
  </xsl:template>

  <xsl:template match="xqx:moduleDecl">
    <xsl:text> module </xsl:text>
    <xsl:value-of select="xqx:prefix"/>
    <xsl:value-of select="$EQUAL"/>
    <xsl:call-template name="quote">
      <xsl:with-param name="item" select="xqx:uri" />
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="xqx:prolog">
    <xsl:for-each select="*">
      <xsl:apply-templates select="."/>
      <xsl:value-of select="$SEMICOLON"/>
      <xsl:value-of select="$NEWLINE"/>
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="xqx:libraryModule">
    <xsl:apply-templates select="xqx:moduleDecl"/>
    <xsl:apply-templates select="xqx:prolog"/>
  </xsl:template>

  <xsl:template match="xqx:mainModule">
    <xsl:apply-templates select="xqx:prolog"/>
    <xsl:apply-templates select="xqx:queryBody"/>
  </xsl:template>

  <xsl:template match="xqx:module">
    <xslt:transform version="1.0">
    
      <xslt:template match="@* | node()">
        <xslt:copy>
          <xslt:apply-templates select="@* | node()" />
        </xslt:copy>
      </xslt:template>
      
      <xslt:template match="/">
        <xsl:apply-templates select="*"/>
      </xslt:template>
      
    </xslt:transform>
  </xsl:template>

</xsl:stylesheet>