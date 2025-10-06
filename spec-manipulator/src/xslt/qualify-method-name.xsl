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
  
  <!-- Transform InternalMethodHead: add name attribute -->
  <xsl:template match="InternalMethodHead">
    <xsl:variable name="receiverTy" select="receiver/NormalParam/@ty"/>
    <xsl:variable name="methodName" select="@methodName"/>
    
    <!-- Split by space and take from position 2 to end, concatenate without spaces -->
    <xsl:variable name="typeParts" select="tokenize($receiverTy, ' ')"/>
    <xsl:variable name="typeWithoutArticle">
      <xsl:for-each select="$typeParts[position() gt 1]">
        <xsl:value-of select="."/>
      </xsl:for-each>
    </xsl:variable>
    
    <xsl:variable name="name" select="concat($typeWithoutArticle, '.[[', $methodName, ']]')"/>
    
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:attribute name="name">
        <xsl:value-of select="$name"/>
      </xsl:attribute>
      <xsl:apply-templates select="node()"/>
    </xsl:copy>
  </xsl:template>
  
  <!-- Transform ConcreteMethodHead: add name attribute -->
  <xsl:template match="ConcreteMethodHead">
    <xsl:variable name="receiverTy" select="receiver/NormalParam/@ty"/>
    <xsl:variable name="concMethodName" select="@concMethodName"/>
    
    <!-- Split by space and take from position 2 to end, concatenate without spaces -->
    <xsl:variable name="typeParts" select="tokenize($receiverTy, ' ')"/>
    <xsl:variable name="typeWithoutArticle">
      <xsl:for-each select="$typeParts[position() gt 1]">
        <xsl:value-of select="."/>
      </xsl:for-each>
    </xsl:variable>
    
    <xsl:variable name="name" select="concat($typeWithoutArticle, '.', $concMethodName)"/>
    
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:attribute name="name">
        <xsl:value-of select="$name"/>
      </xsl:attribute>
      <xsl:apply-templates select="node()"/>
    </xsl:copy>
  </xsl:template>
  
</xsl:stylesheet>