<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:output method="xml" indent="yes" encoding="UTF-8"/>
  <xsl:strip-space elements="*"/>
  
  <!-- Identity template - copy everything by default -->
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
  
  <!-- Transform IfStep nodes -->
  <xsl:template match="IfStep">
    <xsl:copy>
      <!-- Copy existing attributes -->
      <xsl:copy-of select="@*"/>
      
      <!-- If no elseStep attribute exists (meaning there's an elseStep child), copy ElseConfig attributes to the IfStep parent -->
      <xsl:if test="not(@elseStep)">
        <xsl:copy-of select="elseConfig/ElseConfig/@*"/>
      </xsl:if>
      
      <!-- Copy all child elements except elseConfig -->
      <xsl:apply-templates select="* except elseConfig"/>
    </xsl:copy>
  </xsl:template>
  
</xsl:stylesheet>