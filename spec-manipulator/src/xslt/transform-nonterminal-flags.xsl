<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:output method="xml" indent="yes" encoding="UTF-8"/>
  <xsl:strip-space elements="*"/>
  
  <!-- Identity template: copy everything by default -->
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
  
  <!-- Convert text-only GrammarSymbolLiteral.flags to a Flag node with value attribute -->
  <xsl:template match="GrammarSymbolLiteral/flags[not(*) and normalize-space(.) != '']">
    <flags>
      <Flag>
        <xsl:attribute name="value">
          <xsl:value-of select="normalize-space(.)"/>
        </xsl:attribute>
      </Flag>
    </flags>
  </xsl:template>
  
  <!-- Same for NonterminalLiteral -->
  <xsl:template match="NonterminalLiteral/flags[not(*) and normalize-space(.) != '']">
    <flags>
      <Flag>
        <xsl:attribute name="value">
          <xsl:value-of select="normalize-space(.)"/>
        </xsl:attribute>
      </Flag>
    </flags>
  </xsl:template>
</xsl:stylesheet>