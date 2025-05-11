<?xml version="1.0"?>
<xsl:transform xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
						xmlns:opml="http://www.opml.org/2002/Attributes"
						xmlns:xlink="http://www.w3.org/1999/xlink"
               version="1.0">

<xsl:output indent="yes" />

<xsl:template match="/opml/body">
	<root xmlns:xlink="http://www.w3.org/1999/xlink">
		<xsl:apply-templates select="/opml/head/*" />
		<xsl:apply-templates select="outline | @*" />
	</root>
</xsl:template>

<xsl:template match="/opml/head/* | @text">
	<xsl:attribute name="opml:{name()}">
		<xsl:value-of select="." />
	</xsl:attribute>
</xsl:template>

<xsl:template match="@url">
	<xsl:attribute name="xlink:href">
		<xsl:value-of select="." />
	</xsl:attribute>
	<xsl:attribute name="xlink:type">simple</xsl:attribute>
</xsl:template>

<xsl:template match="@type" />

<xsl:template match="@*">
	<xsl:copy />
</xsl:template>

<xsl:template match="outline">
	<xsl:element name="{@type}">
		<xsl:apply-templates select="outline | @*" />
	</xsl:element>
</xsl:template>

</xsl:transform>