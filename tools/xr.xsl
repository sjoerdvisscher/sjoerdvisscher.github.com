<?xml version="1.0"?>
<xs:stylesheet
	xmlns:xs="http://www.w3.org/1999/XSL/Transform"
	xmlns:xsl="http://www.w3.org/1999/XSL/TransformAlt"
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
	xmlns:xr="http://w3future.com/xr/ns/"
	version="1.0">

<xs:namespace-alias stylesheet-prefix="xsl" result-prefix="xs"/>

<xs:template match="xr:transform">

  <xsl:stylesheet version="1.0">
    <xs:copy-of select="namespace::*" />

    <xsl:param name="documentURI" />
    <xsl:output indent="yes" />
    
    <xs:copy-of select="xs:*" />

    <xsl:template match="/">
      <rdf:RDF>
        <xsl:attribute name="base" namespace="http://www.w3.org/XML/1998/namespace"><xsl:value-of select="$documentURI" /></xsl:attribute>
        <xs:apply-templates select="*" mode="select" />
      </rdf:RDF>
    </xsl:template>

    <xs:for-each select="xr:introducing[@xr:select]">
      <xsl:template match="{@xr:select}" mode="object">
        <xs:apply-templates select="*" mode="resourceRef" />
      </xsl:template>
    </xs:for-each>
    
    <xsl:template match="*[not(*)]" mode="object">
      <xsl:copy-of select="@xml:lang" />
      <xsl:value-of select="." />
    </xsl:template>

    <xsl:template match="*[*]" mode="object">
      <xsl:attribute name="rdf:parseType">Literal</xsl:attribute>
      <xsl:copy-of select="@xml:lang" />
      <xsl:copy-of select="node()" />
    </xsl:template>

    <xsl:template name="uri">
      <xsl:param name="uri" />
      <xsl:choose>
        <xsl:when test="normalize-space($uri)!=''">
          <xsl:attribute name="rdf:about">
            <xsl:value-of select="$uri" />
          </xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="rdf:nodeID">
            <xsl:text>blank</xsl:text><xsl:value-of select="count(preceding::*)+count(ancestor::*)" />
          </xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:template>

    <xs:copy-of select="xs:*" />

  </xsl:stylesheet>

</xs:template>

<xs:template match="*" mode="select">
  <xs:apply-templates select="." mode="property" />
</xs:template>

<xs:template match="*[@xr:select]" mode="select">
  <xsl:for-each select="{@xr:select}">
    <xs:apply-templates select="." mode="property" />
  </xsl:for-each>
</xs:template>

<xs:template match="*[@xr:select][@xr:collectionType='collection']" mode="select">
  <xs:copy>
    <xs:attribute name="rdf:parseType">Collection</xs:attribute>
    <xsl:for-each select="{@xr:select}">
      <xs:apply-templates select="*" mode="resource" />
    </xsl:for-each>
  </xs:copy>
</xs:template>

<xs:template match="*[@xr:select][@xr:collectionType='sequence']" mode="select">
  <xs:copy>
    <rdf:Seq>
      <xsl:for-each select="{@xr:select}">
        <rdf:li><xs:apply-templates select="." mode="propertyValue" /></rdf:li>
      </xsl:for-each>
    </rdf:Seq>
  </xs:copy>
</xs:template>

<xs:template match="*[@xr:select][@xr:collectionType='bag']" mode="select">
  <xs:copy>
    <rdf:Bag>
      <xsl:for-each select="{@xr:select}">
        <rdf:li><xs:apply-templates select="." mode="propertyValue" /></rdf:li>
      </xsl:for-each>
    </rdf:Bag>
  </xs:copy>
</xs:template>

<xs:template match="*[@xr:select][@xr:collectionType='alternatives']" mode="select">
  <xs:copy>
    <rdf:Alt>
      <xsl:for-each select="{@xr:select}">
        <rdf:li><xs:apply-templates select="." mode="propertyValue" /></rdf:li>
      </xsl:for-each>
    </rdf:Alt>
  </xs:copy>
</xs:template>

<xs:template match="*" mode="property">
  <xs:copy>
    <xs:apply-templates select="." mode="propertyValue" />
  </xs:copy>
</xs:template>

<xs:template match="xr:introducing" mode="property">
  <xs:apply-templates select="." mode="propertyValue" />
</xs:template>

<xs:template match="*[*]" mode="propertyValue">
  <xs:apply-templates select="*" mode="resource" />
</xs:template>

<xs:template match="*[not(*)][text()]" mode="propertyValue">
  <xs:call-template name="makeTemplate">
    <xs:with-param name="text" select="text()" />
  </xs:call-template>
</xs:template>

<xs:template name="makeTemplate">
  <xs:param name="text" select="." />
  <xs:choose>
    <xs:when test="contains($text,'{')">
      <xs:value-of select="substring-before($text, '{')" />
      <xsl:value-of>
        <xs:attribute name="select">
          <xs:value-of select="substring-before(substring-after($text, '{'), '}')" />
        </xs:attribute>
      </xsl:value-of>
      <xs:call-template name="makeTemplate">
        <xs:with-param name="text" select="substring-after($text, '}')" />
      </xs:call-template>
    </xs:when>
    <xs:otherwise>
      <xs:value-of select="$text" />
    </xs:otherwise>
  </xs:choose>
</xs:template>

<xs:template match="*" mode="propertyValue">
  <xsl:apply-templates select="." mode="object" />
</xs:template>

<xs:template match="*" mode="resource">
  <xs:copy>
    <xs:if test="@xr:uri|@xr:uriSelect">
      <xs:call-template name="uri" />
    </xs:if>
    <xs:apply-templates select="*" mode="select" />
  </xs:copy>
</xs:template>

<xs:template match="*" mode="resourceRef">
  <xs:copy>
    <xs:call-template name="uri" />
  </xs:copy>
</xs:template>

<xs:template name="uri">
  <xsl:call-template name="uri">
    <xsl:with-param name="uri">
      <xs:apply-templates select="@xr:uri|@xr:uriSelect" />
    </xsl:with-param>
  </xsl:call-template>
</xs:template>

<xs:template match="@xr:uri">
  <xs:value-of select="." />
</xs:template>

<xs:template match="@xr:uriSelect">
  <xsl:value-of select="{.}" />
</xs:template>

</xs:stylesheet>
