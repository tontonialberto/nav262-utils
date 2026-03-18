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
  
  <!-- Hoist MathOpExpression/op child element name to @op and remove op subtree -->
  <xsl:template match="MathOpExpression[op/*]">
    <MathOpExpression>
      <xsl:apply-templates select="@*"/>
      <xsl:attribute name="op">
        <xsl:value-of select="name(op/*[1])"/>
      </xsl:attribute>
      <xsl:apply-templates select="node()[not(self::op)]"/>
    </MathOpExpression>
  </xsl:template>
  
</xsl:stylesheet>