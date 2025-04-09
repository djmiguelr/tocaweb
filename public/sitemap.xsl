<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Sitemap XML - Toca Stereo</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #333;
            margin: 0;
            padding: 2rem;
          }
          h1 {
            color: #2563eb;
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            background: white;
            margin: 1rem 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          th {
            background: #f3f4f6;
            padding: 1rem;
            text-align: left;
          }
          td {
            padding: 0.75rem 1rem;
            border-top: 1px solid #e5e7eb;
          }
          tr:hover td {
            background: #f9fafb;
          }
          .news {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            background: #3b82f6;
            color: white;
            border-radius: 4px;
            font-size: 0.875rem;
            margin-left: 0.5rem;
          }
        </style>
      </head>
      <body>
        <h1>Sitemap XML - Toca Stereo</h1>
        <xsl:apply-templates/>
      </body>
    </html>
  </xsl:template>
  
  <xsl:template match="sitemap:urlset">
    <table>
      <tr>
        <th>URL</th>
        <th>Última modificación</th>
        <th>Frecuencia</th>
        <th>Prioridad</th>
      </tr>
      <xsl:for-each select="sitemap:url">
        <tr>
          <td>
            <xsl:value-of select="sitemap:loc"/>
            <xsl:if test="news:news">
              <span class="news">Noticia</span>
            </xsl:if>
          </td>
          <td><xsl:value-of select="sitemap:lastmod"/></td>
          <td><xsl:value-of select="sitemap:changefreq"/></td>
          <td><xsl:value-of select="sitemap:priority"/></td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:template>
  
  <xsl:template match="sitemap:sitemapindex">
    <table>
      <tr>
        <th>Sitemap</th>
        <th>Última modificación</th>
      </tr>
      <xsl:for-each select="sitemap:sitemap">
        <tr>
          <td><xsl:value-of select="sitemap:loc"/></td>
          <td><xsl:value-of select="sitemap:lastmod"/></td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:template>
</xsl:stylesheet>
