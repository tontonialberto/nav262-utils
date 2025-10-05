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
  
  <!-- Template for RepeatStep with While condition -->
  <xsl:template match="RepeatStep[cond/While]">
    <RepeatWhileStep>
      <xsl:apply-templates select="@*"/>
      <!-- Copy the condition from inside While -->
      <cond>
        <xsl:apply-templates select="cond/While/cond/node()"/>
      </cond>
      <!-- Copy body and other children except the cond -->
      <xsl:apply-templates select="node()[name()!='cond']"/>
    </RepeatWhileStep>
  </xsl:template>
  
  <!-- Template for RepeatStep with Until condition -->
  <xsl:template match="RepeatStep[cond/Until]">
    <RepeatUntilStep>
      <xsl:apply-templates select="@*"/>
      <!-- Copy the condition from inside Until -->
      <cond>
        <xsl:apply-templates select="cond/Until/cond/node()"/>
      </cond>
      <!-- Copy body and other children except the cond -->
      <xsl:apply-templates select="node()[name()!='cond']"/>
    </RepeatUntilStep>
  </xsl:template>
  
  <!-- Template for RepeatStep with NoCondition -->
  <xsl:template match="RepeatStep[cond/NoCondition]">
    <RepeatNoCondStep>
      <xsl:apply-templates select="@*"/>
      <!-- Copy all children except the cond -->
      <xsl:apply-templates select="node()[name()!='cond']"/>
    </RepeatNoCondStep>
  </xsl:template>
  
</xsl:stylesheet>
