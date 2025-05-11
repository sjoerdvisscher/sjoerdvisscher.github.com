<xsl:transform xmlns="http://purl.org/atom/ns#" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
  xmlns:atom="http://purl.org/atom/ns#" 
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
  version="1.0" >

<xsl:variable name="xml-ns" select="'http://www.w3.org/XML/1998/namespace'"/>
<xsl:variable name="atom-ns" select="'http://purl.org/atom/ns#'"/>

<xsl:template match="*">
  <rdf:RDF>
    <xsl:apply-templates select="." mode="object" />
  </rdf:RDF>
</xsl:template>

<xsl:template match="atom:atom">
  <rdf:RDF>
    <xsl:apply-templates select="*" mode="object" />
  </rdf:RDF>
</xsl:template>

<!-- (otherwise) simpleProp -->
<xsl:template match="*" mode="object">
  <rdf:Description>
    <xsl:apply-templates select="@ref" />
    <xsl:apply-templates select="*" mode="property" />
  </rdf:Description>
</xsl:template>

<xsl:template match="*[@ref][not(node())]" mode="object">
  <xsl:attribute name="rdf:resource"><xsl:value-of select="@ref" /></xsl:attribute>
</xsl:template>

<!-- complexLiteralProp -->
<xsl:template match="*[count(@*) &gt; count(@ref) + count(@mode)]" mode="object">
  <xsl:attribute name="rdf:parseType">Resource</xsl:attribute>
  <xsl:apply-templates select="@*" mode="property" />
  <rdf:value>
    <xsl:apply-templates select="@mode" />
    <xsl:copy-of select="node()" />
  </rdf:value>
</xsl:template>

<!-- literalProp -->
<xsl:template match="*[count(@mode)=count(@*)][not(*) or @mode]" mode="object">
  <xsl:apply-templates select="@mode" />
  <xsl:copy-of select="node()" />
</xsl:template>

<xsl:template match="@mode">
  <xsl:attribute name="rdf:datatype"><xsl:value-of select="$atom-ns" /><xsl:value-of select="." /></xsl:attribute>
</xsl:template>

<xsl:template match="@mode[.='xml']">
  <xsl:attribute name="rdf:parseType">Literal</xsl:attribute>
</xsl:template>

<xsl:template match="@ref">
  <xsl:attribute name="rdf:about"><xsl:value-of select="." /></xsl:attribute>
</xsl:template>

<xsl:template match="@*[namespace-uri()='']" mode="property">
  <xsl:element name="{name(.)}" namespace="{namespace-uri(..)}">
    <xsl:value-of select="."/>
  </xsl:element>
</xsl:template>

<xsl:template match="@*" mode="property">
  <xsl:element name="{name(.)}" namespace="{namespace-uri(.)}">
    <xsl:value-of select="."/>
  </xsl:element>
</xsl:template>

<xsl:template match="@ref" mode="property" priority="2" />
<xsl:template match="@mode" mode="property" priority="2" />

<xsl:template match="*" mode="property">
  <xsl:copy><xsl:apply-templates select="." mode="object" /></xsl:copy>
</xsl:template>

</xsl:transform>