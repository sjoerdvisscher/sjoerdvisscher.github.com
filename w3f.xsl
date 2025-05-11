<?xml version="1.0"?>
<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:h="http://www.w3.org/2002/06/xhtml2"
  xmlns:w3f="http://w3future.com/rdf#"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:xi="http://www.w3.org/2001/XInclude"
  xmlns:foaf="http://xmlns.com/foaf/0.1/"
  exclude-result-prefixes="rdf rdfs w3f dc foaf xi h"
  version="1.0">
  <xsl:import href="../tools/xhtml2.xsl" />
  <xsl:variable name="doc" select="/" />
  <xsl:template match="h:html[not(//h:h[@id='pagetitle'])]">
    <html>
      <xsl:apply-templates select="@*" />
      <head>
        <xsl:apply-templates select="h:head/@*" />
        <xsl:apply-templates select="h:head/* | h:head/node()" />
        <meta name="keywords" content="w3, www, world, wide, web, future, weblog, latest, news, javascript, js, soap, xml, rpc, html, mozilla, internet, explorer, netscape, semantic, rdf, xsl, xhtml, css, meta, transform" />
        <meta name="description" content="{h:body/h:section/h:p[1]}" />
        <meta name="ICBM" content="52.0788, 4.3092" />
        <link rel="icon" href="http://w3future.com/favicon.ico" type="application/ico" />
        <link rel="stylesheet" type="text/css" href="http://w3future.com/w3f/xhtml2.css" />
        <xsl:if test="system-property('xsl:vendor')!='Transformiix'">
          <script type="text/javascript" src="http://statistics.q42.nl/counter/default.asp?id=w3future"></script>
        </xsl:if>
        <script type="text/javascript" src="http://api.flattr.com/js/0.5.0/load.js?mode=auto" async="true"></script>
      </head>
      <body>
        <xsl:apply-templates select="h:body/@*" />
        <h1 id="pagetitle">w3future.com</h1>
        <xsl:apply-templates select="h:body/*" />
        <div id="footer">
          <p id="copyright">
            <xsl:if test="system-property('xsl:vendor')!='Transformiix'">
<script type="text/javascript"><![CDATA[
    var d=document;
    var sid="346588";
    var CONTENTSECTION="";
    var osp_URL=d.URL;
    var osp_Title=d.title;
    var t=new Date();
    var p="http://stat.onestat.com/stat.aspx?tagver=2&sid="+sid;
    p+="&url="+escape(osp_URL);
    p+="&ti="+escape(osp_Title);
    p+="&section="+escape(CONTENTSECTION);
    p+="&rf="+escape(parent==self?document.referrer:top.document.referrer);
    p+="&tz="+escape(t.getTimezoneOffset());
    p+="&ch="+escape(t.getHours());
    p+="&js=1";
    p+="&ul="+escape(navigator.appName=="Netscape"?navigator.language:navigator.userLanguage);
    if(typeof(screen)=="object"){
       p+="&sr="+screen.width+"x"+screen.height;p+="&cd="+screen.colorDepth;
       p+="&jo="+(navigator.javaEnabled()?"Yes":"No");
    }
    d.write('<a href="http://www.onestat.com/aspx/login.aspx?sid='+sid+'" target=_blank><img id="ONESTAT_TAG" border="0" src="'+p+'" alt="This site tracked by OneStat.com. Get your own free site counter."></'+'a>');
]]></script>
              <script type="text/javascript" src="http://www.google-analytics.com/urchin.js"></script>
              <script type="text/javascript">_uacct = "UA-61155-1";urchinTracker();</script>
            </xsl:if>
          </p>
          <div id="adsense">
            <xsl:if test="system-property('xsl:vendor')!='Transformiix'">
              <script type="text/javascript"><![CDATA[
                google_ad_client = "pub-9281881402552436"; 
                google_ad_width = 728; 
                google_ad_height = 90; 
                google_ad_format = "728x90_as"; 
                google_color_border = "000033"; 
                google_color_bg = "d5d5dd"; 
                google_color_link = "000033"; 
                google_color_url = "7f5f30"; 
                google_color_text = "000033"; 
                google_ad_channel = "8852328146";
              ]]></script>
              <script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script>
            </xsl:if>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
  
  <xsl:template match="h:section[@id='note']">
    <div id="note">
      <p id="Flattr"><a class="FlattrButton" rev="flattr;button:compact;" href="{substring-before(/*/@xml:base, '.txt')}.xml"></a></p>
      <xsl:apply-templates select="node()" />
      <div style="clear: both"></div>
    </div>
  </xsl:template>
  
  <xsl:template match="h:h[@id]/h:a[not(@rel)]">
    <a rel="bookmark" href="{substring-before(@href, '#')}#{../@id}"><xsl:copy-of select="@title" />
      <xsl:apply-templates select="node()" />
    </a>
  </xsl:template>
  <xsl:template match="h:head/h:title[not(contains(., 'w3future.com'))]">
    <title><xsl:value-of select="." /> - w3future.com</title>
  </xsl:template>
  <xsl:template match="rdf:RDF">
    <xsl:apply-templates select="*" />
  </xsl:template>
  
  <xsl:template match="rdf:Description[w3f:referrer/rdf:Description[w3f:online]]">
    <ul class="xhtml2-nl">
      <li class="xhtml2-label">Referrers</li>
      <xsl:for-each select="w3f:referrer/rdf:Description[w3f:online]">
        <xsl:if test="not(preceding::rdf:Description[w3f:excerpt=current()/w3f:excerpt or (not(w3f:excerpt) and dc:title=current()/dc:title)]) and not(dc:title=w3f:excerpt)">
          <li>
            <a href="{@rdf:about}">
            <xsl:choose>
              <xsl:when test="dc:title"><xsl:value-of select="dc:title" /></xsl:when>
              <xsl:otherwise><xsl:value-of select="@rdf:about" /></xsl:otherwise>
            </xsl:choose>
            </a><br/><xsl:value-of select="substring(w3f:excerpt,0,500)" />
          </li>
        </xsl:if>
      </xsl:for-each>
    </ul>
  </xsl:template>
  
  <xsl:template match="foaf:Person">
    <h3>More information</h3>
    <p>Generated from <a rel="meta" href="{../@xml:base}">my foaf file</a>.</p>
    <h4>Education</h4>
    <ul>
      <xsl:for-each select="foaf:schoolHomepage/foaf:Document">
        <li><a href="{@rdf:about}"><xsl:value-of select="dc:title" /></a></li>
      </xsl:for-each>
    </ul>
    <h4>Current Job</h4>
    <ul>
      <xsl:for-each select="foaf:workplaceHomepage/foaf:Document">
        <li><a href="{@rdf:about}"><xsl:value-of select="dc:title" /></a></li>
      </xsl:for-each>
    </ul>
    <h4>Picture</h4>
    <p>
      <img class="picture" src="{foaf:depiction[1]/foaf:Image/@rdf:about}" />
    </p>
    <h4>Pictures of me and others (codepiction)</h4>
    <ul>
      <xsl:for-each select="/rdf:RDF/foaf:Image">
        <li>
          <a href="{@rdf:about}"><xsl:value-of select="dc:title" /></a>
          (<a href="{dc:source/*/@rdf:about}"><xsl:value-of select="dc:coverage" />, <xsl:value-of select="dc:date" /></a>)
        </li>
      </xsl:for-each>
    </ul>
  </xsl:template>
  <xsl:template match="rdf:Description" />
  <xsl:template match="foaf:Image" />
  
  <xsl:template match="opml">
    <xsl:apply-templates select="body/outline" />
  </xsl:template>
  
  <xsl:template match="outline[outline]">
    <ul class="xhtml2-nl">
      <li class="xhtml2-label"><xsl:value-of select="@text" /></li>
      <xsl:for-each select="outline">
        <li><xsl:apply-templates select="." /></li>
      </xsl:for-each>
    </ul>
  </xsl:template>
  
  <xsl:template match="outline[@url]">
    <a href="{@url}"><xsl:value-of select="@text" /></a>
  </xsl:template>
  
  <xsl:template match="opml[contains(head/title, 'Subscriptions')]">
    <ul class="xhtml2-nl">
      <li class="xhtml2-label">What I read</li>
      <xsl:for-each select="body//outline[not(outline)]">
        <xsl:sort select="@text" />
        <li><xsl:apply-templates select="." /></li>
      </xsl:for-each>
    </ul>
  </xsl:template>
<!--
  <xsl:template match="outline[@htmlUrl]">
    <xsl:attribute name="title"><xsl:value-of select="@text" /> - <xsl:value-of select="@description" /></xsl:attribute>
    <a href="{@xmlUrl}"><img src="/weblog/images/tinyXML.jpg" width="16" height="7" alt="RSS file" /></a>&#160;
    <a href="{@htmlUrl}">
      <xsl:call-template name="cutAtSpaces">
        <xsl:with-param name="text" select="concat(substring-before(concat(normalize-space(@text), ','), ','), ' ')" />
        <xsl:with-param name="max" select="25" />
      </xsl:call-template>
    </a>
  </xsl:template>
-->
  <xsl:template match="outline[@htmlUrl]">
    <xsl:attribute name="title"><xsl:value-of select="@title" /></xsl:attribute>
    <a href="{@xmlUrl}"><img src="/weblog/images/tinyXML.jpg" width="16" height="7" alt="RSS file" /></a> 
    <a href="{@htmlUrl}">
      <xsl:call-template name="cutAtSpaces">
        <xsl:with-param name="text" select="concat(substring-before(concat(normalize-space(@title), ','), ','), ' ')" />
        <xsl:with-param name="max" select="25" />
      </xsl:call-template>
    </a>
  </xsl:template>
  <xsl:template name="cutAtSpaces">
    <xsl:param name="text" />
    <xsl:param name="max" />
    <xsl:variable name="word" select="substring-before($text, ' ')" />
    <xsl:variable name="next" select="substring-after($text, ' ')" />
    <xsl:choose>
      <xsl:when test="(string-length($word) &lt;= ($max - 2)) or ((string-length($word) &lt;= $max) and ($next=''))">
        <xsl:value-of select="$word" /><xsl:text> </xsl:text>
        <xsl:if test="$next!=''">
          <xsl:call-template name="cutAtSpaces">
            <xsl:with-param name="text" select="$next" />
            <xsl:with-param name="max" select="$max - 1 - string-length($word)" />
          </xsl:call-template>
        </xsl:if>
      </xsl:when>  
      <xsl:otherwise>…</xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match="h:div[@class='year']">
    <xsl:variable name="base" select="substring(/h:html/@xml:base, 0, 33)" />
    <xsl:apply-templates select="document(concat($base, '12', '/index.xml?notransform'))//h:section[@id='content']" mode="month" />
    <xsl:apply-templates select="document(concat($base, '11', '/index.xml?notransform'))//h:section[@id='content']" mode="month" />
    <xsl:apply-templates select="document(concat($base, '10', '/index.xml?notransform'))//h:section[@id='content']" mode="month" />
    <xsl:apply-templates select="document(concat($base, '09', '/index.xml?notransform'))//h:section[@id='content']" mode="month" />
    <xsl:apply-templates select="document(concat($base, '08', '/index.xml?notransform'))//h:section[@id='content']" mode="month" />
    <xsl:apply-templates select="document(concat($base, '07', '/index.xml?notransform'))//h:section[@id='content']" mode="month" />
    <xsl:apply-templates select="document(concat($base, '06', '/index.xml?notransform'))//h:section[@id='content']" mode="month" />
    <xsl:apply-templates select="document(concat($base, '05', '/index.xml?notransform'))//h:section[@id='content']" mode="month" />
    <xsl:apply-templates select="document(concat($base, '04', '/index.xml?notransform'))//h:section[@id='content']" mode="month" />
    <xsl:apply-templates select="document(concat($base, '03', '/index.xml?notransform'))//h:section[@id='content']" mode="month" />
    <xsl:apply-templates select="document(concat($base, '02', '/index.xml?notransform'))//h:section[@id='content']" mode="month" />
    <xsl:apply-templates select="document(concat($base, '01', '/index.xml?notransform'))//h:section[@id='content']" mode="month" />
  </xsl:template>
  
  <xsl:template match="h:section" mode="month">
    <div>
      <h3><a href="{/h:html/@xml:base}"><xsl:value-of select="substring-before(substring-after(h:section[2]/h:h, ', '), ' ')" /></a></h3>
      <xsl:apply-templates select="h:section[@id!='note']/h:section/h:h[.!='']" />
    </div>
  </xsl:template>
  
  <xsl:template match="h:div[@class='all']">
    <xsl:apply-templates select="document('http://w3future.com/weblog/2002/01/index.xml?notransform')//h:section[@id='content']" mode="allyear">
      <xsl:with-param name="year" select="'2002'" />
    </xsl:apply-templates>
  </xsl:template>
  <xsl:template match="h:section" mode="allyear">
    <xsl:param name="year" />
    <xsl:apply-templates select="document(concat('http://w3future.com/weblog/', (1 + number($year)), '/01/index.xml?notransform'))//h:section[@id='content']" mode="allyear">
      <xsl:with-param name="year" select="1 + number($year)" />
    </xsl:apply-templates>
    <div id="year{$year}">
      <h2><a href="#year{$year}"><xsl:value-of select="$year" /></a></h2>
      <xsl:apply-templates select="." mode="allmonth">
        <xsl:with-param name="year" select="$year" />
        <xsl:with-param name="month" select="'01'" />
      </xsl:apply-templates>
    </div>
  </xsl:template>
  <xsl:template match="h:section" mode="allmonth">
    <xsl:param name="year" />
    <xsl:param name="month" />
    <xsl:variable name="monthnext">
      <xsl:choose>
        <xsl:when test="number($month) &lt; 9"><xsl:value-of select="concat('0', number($month) + 1)" /></xsl:when>
        <xsl:otherwise><xsl:value-of select="number($month) + 1" /></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="$monthnext!='13'">
      <xsl:apply-templates select="document(concat('http://w3future.com/weblog/', $year, '/', $monthnext, '/index.xml?notransform'))//h:section[@id='content']" mode="allmonth">
        <xsl:with-param name="year" select="$year" />
        <xsl:with-param name="month" select="$monthnext" />
      </xsl:apply-templates>
    </xsl:if>
    <div id="month{$year}-{$month}">
      <h3><a href="#month{$year}-{$month}"><xsl:value-of select="substring-before(substring-after(h:section[2]/h:h, ', '), ' ')" /></a></h3>
      <xsl:for-each select="h:section[@id!='note']/h:section">
        <div>
          <xsl:copy-of select="@id" />
          <h4><a href="#{@id}"><xsl:value-of select="h:h" /></a></h4>
          <xsl:apply-templates select="h:h/following-sibling::node()" />
        </div>
      </xsl:for-each>
    </div>
  </xsl:template>
  
  <xsl:template match="h:div[@id='home']">
    <xsl:apply-templates select="document(xi:include/@href)//h:li" mode="biglink" />
  </xsl:template>
  
  <xsl:template match="h:li" mode="biglink">
    <h4><a href="{@href}"><xsl:value-of select="." /></a></h4>
    <p><xsl:value-of select="@title" /></p>
  </xsl:template>
  
  <xsl:template match="h:section[@id='sidebar']">
    <div>
      <xsl:apply-templates select="@* | node()" />
      <xsl:apply-templates select="document('http://w3future.com/weblog/sidebars/advertisements.opml')/opml" />
    </div>
  </xsl:template>
  <xsl:template match="@href" mode="inlink" priority="9">
    <xsl:copy>
      <xsl:value-of select="."/>
      <xsl:text>#hoi</xsl:text>
    </xsl:copy>
  </xsl:template>
</xsl:transform>
