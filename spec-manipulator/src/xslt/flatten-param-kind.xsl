<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:output method="xml" indent="yes" encoding="UTF-8"/>
  <xsl:strip-space elements="*"/>
  
  <!-- Identity template - copy everything by default -->
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
  
  <!-- Transform Param nodes -->
  <xsl:template match="Param">
    <xsl:choose>
      <xsl:when test="kind/Normal">
        <NormalParam>
          <xsl:apply-templates select="@*"/>
          <xsl:apply-templates select="*[not(self::kind)]"/>
        </NormalParam>
      </xsl:when>
      <xsl:when test="kind/Optional">
        <OptionalParam>
          <xsl:apply-templates select="@*"/>
          <xsl:apply-templates select="*[not(self::kind)]"/>
        </OptionalParam>
      </xsl:when>
      <xsl:when test="kind/Variadic">
        <VariadicParam>
          <xsl:apply-templates select="@*"/>
          <xsl:apply-templates select="*[not(self::kind)]"/>
        </VariadicParam>
      </xsl:when>
      <xsl:otherwise>
        <!-- Fallback - copy as is if kind structure is unexpected -->
        <xsl:copy>
          <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
</xsl:stylesheet>