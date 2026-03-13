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
  
  <!-- RemoveStep with First/count subtree: rename, mark first, and flatten target/count -->
  <xsl:template match="RemoveStep[target/First/count]">
    <RemoveCountStep>
      <xsl:apply-templates select="@*"/>
      <xsl:attribute name="first">true</xsl:attribute>
      <count>
        <xsl:apply-templates select="target/First/count/node()"/>
      </count>
      <xsl:apply-templates select="node()[not(self::target)]"/>
    </RemoveCountStep>
  </xsl:template>
  
  <!-- RemoveStep with First/@count attribute: rename, mark first, and move count attribute -->
  <xsl:template match="RemoveStep[target/First/@count]">
    <RemoveCountStep>
      <xsl:apply-templates select="@*"/>
      <xsl:attribute name="first">true</xsl:attribute>
      <xsl:copy-of select="target/First/@count"/>
      <xsl:apply-templates select="node()[not(self::target)]"/>
    </RemoveCountStep>
  </xsl:template>

  <!-- RemoveStep with Last/count subtree: rename, mark first=false, and flatten target/count -->
  <xsl:template match="RemoveStep[target/Last/count]">
    <RemoveCountStep>
      <xsl:apply-templates select="@*"/>
      <xsl:attribute name="first">false</xsl:attribute>
      <count>
        <xsl:apply-templates select="target/Last/count/node()"/>
      </count>
      <xsl:apply-templates select="node()[not(self::target)]"/>
    </RemoveCountStep>
  </xsl:template>

  <!-- RemoveStep with Last/@count attribute: rename, mark first=false, and move count attribute -->
  <xsl:template match="RemoveStep[target/Last/@count]">
    <RemoveCountStep>
      <xsl:apply-templates select="@*"/>
      <xsl:attribute name="first">false</xsl:attribute>
      <xsl:copy-of select="target/Last/@count"/>
      <xsl:apply-templates select="node()[not(self::target)]"/>
    </RemoveCountStep>
  </xsl:template>

  <!-- RemoveStep with Element/elem subtree: rename and flatten target/Element/elem -->
  <xsl:template match="RemoveStep[target/Element/elem]">
    <RemoveElementStep>
      <xsl:apply-templates select="@*"/>
      <elem>
        <xsl:apply-templates select="target/Element/elem/node()"/>
      </elem>
      <xsl:apply-templates select="node()[not(self::target)]"/>
    </RemoveElementStep>
  </xsl:template>
  
</xsl:stylesheet>