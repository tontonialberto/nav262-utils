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
  
  <!-- RemoveContextStep with NoRestore: rename to PopContextStep, drop restoreTarget -->
  <xsl:template match="RemoveContextStep[restoreTarget/NoRestore]">
    <PopContextStep>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="node()[not(self::restoreTarget)]"/>
    </PopContextStep>
  </xsl:template>
  
  <!-- RemoveContextStep with Context: rename and flatten Context.ref -->
  <xsl:template match="RemoveContextStep[restoreTarget/Context]">
    <PopContextWithReferenceTargetStep>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="node()[not(self::restoreTarget)]"/>
      <restoreTarget>
        <xsl:apply-templates select="restoreTarget/Context/ref/node()"/>
      </restoreTarget>
    </PopContextWithReferenceTargetStep>
  </xsl:template>

  <!-- RemoveContextStep with StackTop: rename, drop restoreTarget -->
  <xsl:template match="RemoveContextStep[restoreTarget/StackTop]">
    <PopContextWithStackTopTargetStep>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="node()[not(self::restoreTarget)]"/>
    </PopContextWithStackTopTargetStep>
  </xsl:template>
  
</xsl:stylesheet>
