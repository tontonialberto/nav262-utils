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
  
  <!-- Transform TypeCheckCondition/ty text content to Type child -->
  <xsl:template match="TypeCheckCondition/ty">
    <ty>
      <Type>
        <xsl:attribute name="value">
          <xsl:value-of select="normalize-space(.)"/>
        </xsl:attribute>
      </Type>
    </ty>
  </xsl:template>
  
</xsl:stylesheet>