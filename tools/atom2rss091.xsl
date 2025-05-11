<?xml version="1.0"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:a="http://www.w3.org/2005/Atom"
  exclude-result-prefixes="a">

<xsl:template match="a:feed">
  <rss version="0.91">
    <channel>
      <xsl:apply-templates select="a:title|a:subtitle|a:link|a:author/a:email" />
      <language><xsl:value-of select="@xml:lang" /></language>
      <xsl:apply-templates select="a:entry" />
    </channel>
  </rss>
</xsl:template>

<xsl:template match="a:entry">
  <item>
    <xsl:apply-templates select="a:title|a:link|a:summary" />
  </item>
</xsl:template>

<xsl:template match="a:feed/a:subtitle | a:entry/a:summary">
  <description><xsl:value-of select="." /></description>
</xsl:template>

<xsl:template match="a:feed/a:author/a:email">
  <managingEditor><xsl:value-of select="." /></managingEditor>
</xsl:template>

<xsl:template match="a:link[not(@rel) or @rel='alternate'][not(@type) or (@type='text/html')]">
  <link><xsl:value-of select="@href" /></link>
</xsl:template>

<xsl:template match="a:link" />

<xsl:template match="a:*">
  <xsl:element name="{local-name()}"><xsl:value-of select="." /></xsl:element>
</xsl:template>

</xsl:stylesheet>