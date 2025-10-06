<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:output method="xml" indent="yes" encoding="UTF-8"/>
  <xsl:strip-space elements="*"/>
  
  <!-- Identity template: copy everything by default -->
  <xsl:template match="@* | node()">
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:copy>
  </xsl:template>
  
  <!-- Transform NumericMethodHead name attribute -->
  <xsl:template match="NumericMethodHead/@name">
    <xsl:variable name="baseTy" select="../@baseTy"/>
    <xsl:variable name="oldName" select="."/>
    <xsl:variable name="baseTypeName" select="tokenize($baseTy, ' ')[last()]"/>
    
    <xsl:attribute name="name">
      <xsl:value-of select="concat($baseTypeName, '::', $oldName)"/>
    </xsl:attribute>
  </xsl:template>
  
</xsl:stylesheet>