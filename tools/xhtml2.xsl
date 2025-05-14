<?xml version="1.0"?>
<xsl:transform
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:h="http://www.w3.org/2002/06/xhtml2"
	xmlns:ev="http://www.w3.org/2001/xml-events"
	xmlns:xi="http://www.w3.org/2001/XInclude"
	xmlns:xf="http://www.w3.org/2002/xforms/cr"
	exclude-result-prefixes="h ev xi xf"
	version="1.0">

<xsl:output
	method="html"
	doctype-public="-//W3C//DTD HTML 4.01//EN"
	doctype-system="http://www.w3.org/TR/html4/strict.dtd"
	indent="yes"
/>

<xsl:template match="h:meta[text()]">
	<meta>
		<xsl:apply-templates select="@*" />
		<xsl:attribute name="content"><xsl:value-of select="." /></xsl:attribute>
	</meta>
</xsl:template>

<xsl:template match="h:quote">
	<q><xsl:apply-templates select="." mode="href" /></q>
</xsl:template>

<xsl:template match="h:blockcode">
	<pre class="xhtml2-blockcode"><xsl:apply-templates select="." mode="href" /></pre>
</xsl:template>

<xsl:template match="h:nl">
	<ul class="xhtml2-nl"><xsl:apply-templates select="." mode="href" /></ul>
</xsl:template>

<xsl:template match="h:label">
	<li class="xhtml2-label"><xsl:apply-templates select="." mode="href" /></li>
</xsl:template>

<xsl:template match="h:l">
	<span><xsl:apply-templates select="." mode="href" /></span><br/>
</xsl:template>

<xsl:template match="h:l[last()]">
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
	<img src="{@data}" alt="{text()}">
		<xsl:apply-templates select="h:script[@ev:event]" mode="eventattr" />
		<xsl:apply-templates select="@*[name()!='data']" />
	</img>
</xsl:template>

<xsl:template match="h:object[@data][@href]">
	<a href="{@href}"><img src="{@data}" alt="{text()}">
		<xsl:apply-templates select="h:script[@ev:event]" mode="eventattr" />
		<xsl:apply-templates select="@*[name()!='data']" />
	</img></a>
</xsl:template>

<xsl:template match="h:script">
  <script type="text/javascript"><xsl:apply-templates select="@*" /><xsl:comment><xsl:text>
    </xsl:text><xsl:value-of select="." />
  //</xsl:comment></script>
</xsl:template>

<xsl:template match="h:script[comment()]">
  <script type="text/javascript"><xsl:apply-templates select="@*" /><xsl:copy-of select="comment()" /></script>
</xsl:template>

<xsl:template match="h:script[@src]">
	<script type="text/javascript"><xsl:apply-templates select="@*" />&#160;</script>
</xsl:template>

<xsl:template match="h:style[@src]">
	<style><xsl:apply-templates select="@*" />@import url(<xsl:value-of select="@src" />);</style>
</xsl:template>

<xsl:template match="h:script[@ev:event]" mode="eventattr">
  <xsl:attribute name="on{@ev:event}">return handleEvent<xsl:value-of select="count(preceding::h:script)" />()</xsl:attribute>
</xsl:template>

<xsl:template match="h:script[@ev:event]">
  <script type="text/javascript"><xsl:comment>
  function handleEvent<xsl:value-of select="count(preceding::h:script)" />() {
    <xsl:value-of select="." />
    <xsl:if test="@ev:defaultAction='cancel'">;return false</xsl:if>
  }
  //</xsl:comment></script>
</xsl:template>

<xsl:template match="xf:input">
  <div class="xformsrow">
    <span class="xforms-label"><xsl:value-of select="xf:label" /></span>
    <input type="text" class="xforms-input" name="{@id}">
      <xsl:apply-templates select="." mode="href" />
    </input>
  </div>
</xsl:template>

<xsl:template match="xf:trigger">
  <div class="xformsrow">
    <button class="xforms-trigger">
      <xsl:apply-templates select="." mode="href" />
      <xsl:value-of select="xf:label" />
    </button>
  </div>
</xsl:template>

<xsl:template match="xf:submit">
  <div class="xformsrow">
    <input type="submit" class="xforms-submit" value="{xf:label}">
      <xsl:apply-templates select="." mode="href" />
    </input>
  </div>
</xsl:template>

<xsl:template match="xf:label" />

<xsl:template match="h:*[@src]">
	<img src="{@src}" alt="{text()}" />
</xsl:template>

<xsl:template match="h:*">
	<xsl:element name="{local-name()}">
		<xsl:apply-templates select="." mode="href" />
	</xsl:element>
</xsl:template>

<xsl:template match="h:a">
	<a>
		<xsl:apply-templates select="h:script[@ev:event]" mode="eventattr" />
		<xsl:apply-templates select="@*" />
		<xsl:apply-templates select="@*" mode="inlink" />
		<xsl:apply-templates select="*|text()" />
	</a>
</xsl:template>

<xsl:template match="@*">
	<xsl:attribute name="{local-name()}">
		<xsl:value-of select="." />
	</xsl:attribute>
</xsl:template>

<xsl:template match="@href|@rel|@rev|@accesskey|@type|@title" />

<xsl:template match="@*" mode="inlink" />

<xsl:template match="@href|@rel|@rev|@accesskey|@type|@title" mode="inlink">
	<xsl:copy><xsl:value-of select="." /></xsl:copy>
</xsl:template>

<xsl:template match="h:*|xf:*|@*|h:head//h:*[@href]" mode="href">
	<xsl:apply-templates select="h:script[@ev:event]" mode="eventattr" />
	<xsl:apply-templates select="@*" />
	<xsl:apply-templates select="@*" mode="inlink" />
	<xsl:apply-templates select="*|text()" />
</xsl:template>

<xsl:template match="h:*[@href]" mode="href">
	<xsl:apply-templates select="h:script[@ev:event]" mode="eventattr" />
	<xsl:apply-templates select="@*" />
	<a class="xhtml2-link">
		<xsl:apply-templates select="@*" mode="inlink" />
		<xsl:apply-templates select="*|text()" />
	</a>
</xsl:template>

<xsl:template match="xi:include">
  <xsl:variable name="href">
    <xsl:if test="starts-with(@href, '/')">https://w3future.com</xsl:if><xsl:value-of select="@href" />
  </xsl:variable>
  <xsl:apply-templates select="document($href)/*" />
</xsl:template>

<xsl:template match="@xml:lang">
	<xsl:attribute name="lang"><xsl:value-of select="." /></xsl:attribute>
</xsl:template>

<xsl:template match="@xml:base" />

<xsl:template match="comment()">
  <xsl:copy />
</xsl:template>

</xsl:transform>