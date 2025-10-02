<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <!-- Preserve formatting and indentation -->
  <xsl:output method="xml" indent="yes" encoding="UTF-8"/>
  <xsl:strip-space elements="*"/>
  
  <!-- Identity template - copy everything by default -->
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>
  
  <!-- Transform ContainsCondition nodes -->
  <xsl:template match="ContainsCondition">
    <xsl:choose>
      <!-- If target has Expr as only child -->
      <xsl:when test="target/Expr and count(target/*) = 1">
        <ContainsExprCondition>
          <xsl:apply-templates select="@*|node()"/>
        </ContainsExprCondition>
      </xsl:when>
      
      <!-- If target has SuchThat as only child -->
      <xsl:when test="target/SuchThat and count(target/*) = 1">
        <ContainsSuchThatCondition>
          <xsl:apply-templates select="@*|node()"/>
        </ContainsSuchThatCondition>
      </xsl:when>
      
      <!-- If target has WhoseField as only child -->
      <xsl:when test="target/WhoseField and count(target/*) = 1">
        <ContainsWhoseFieldCondition>
          <xsl:apply-templates select="@*|node()"/>
        </ContainsWhoseFieldCondition>
      </xsl:when>
      
      <!-- Fallback - copy as is if structure doesn't match expected patterns -->
      <xsl:otherwise>
        <xsl:copy>
          <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
</xsl:stylesheet>