<?xml version="1.0"?>
<xsl:transform
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:h="http://www.w3.org/2002/06/xhtml2"
	xmlns="http://www.w3.org/1999/xhtml"
	exclude-result-prefixes="h"
	version="1.0">

<xsl:output
	method="xml"
	doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN"
	doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"
	indent="yes"
/>

<xsl:template match="h:nl">
	<ul><xsl:apply-templates select="." mode="href" /></ul>
</xsl:template>

<xsl:template match="h:name">
	<li class="name"><xsl:apply-templates select="." mode="href" /></li>
</xsl:template>

<xsl:template match="h:line">
	<span><xsl:apply-templates select="." mode="href" /></span><br/>
</xsl:template>

<xsl:template match="h:line[last()]">
	<span><xsl:apply-templates select="." mode="href" /></span>
</xsl:template>

<xsl:template match="h:h">
	<h1><xsl:apply-templates select="." mode="href" /></h1>
</xsl:template>

<xsl:template match="h:section//h:h">
	<h2><xsl:apply-templates select="." mode="href" /></h2>
</xsl:template>

<xsl:template match="h:section//h:section//h:h">
	<h3><xsl:apply-templates select="." mode="href" /></h3>
</xsl:template>

<xsl:template match="h:section//h:section//h:section//h:h">
	<h4><xsl:apply-templates select="." mode="href" /></h4>
</xsl:template>

<xsl:template match="h:section//h:section//h:section//h:section//h:h">
	<h5><xsl:apply-templates select="." mode="href" /></h5>
</xsl:template>

<xsl:template match="h:section//h:section//h:section//h:section//h:section//h:h">
	<h6><xsl:apply-templates select="." mode="href" /></h6>
</xsl:template>

<xsl:template match="h:section">
	<div><xsl:apply-templates select="." mode="href" /></div>
</xsl:template>

<xsl:template match="h:object[@data]">
	<img src="{@data}" alt="{text()}" />
</xsl:template>

<xsl:template match="h:*">
	<xsl:element name="{local-name()}">
		<xsl:apply-templates select="." mode="href" />
	</xsl:element>
</xsl:template>

<xsl:template match="h:a">
	<a href="{@href}">
		<xsl:apply-templates select="@*" />
		<xsl:apply-templates select="h:*|text()" />
	</a>
</xsl:template>

<xsl:template match="@*">
	<xsl:attribute name="{local-name()}">
		<xsl:value-of select="." />
	</xsl:attribute>
</xsl:template>

<xsl:template match="h:body//@href" />

<xsl:template match="h:*|@*" mode="href">
	<xsl:apply-templates select="@*" />
	<xsl:apply-templates select="h:*|text()" />
</xsl:template>

<xsl:template match="h:body//h:*[@href]" mode="href">
	<xsl:apply-templates select="@*" />
	<a href="{@href}">
		<xsl:apply-templates select="h:*|text()" />
	</a>
</xsl:template>

<xsl:template match="h:script">
  <script><xsl:apply-templates select="@*" /><xsl:comment>
    <xsl:value-of select="." />
  //</xsl:comment></script>
</xsl:template>

</xsl:transform>