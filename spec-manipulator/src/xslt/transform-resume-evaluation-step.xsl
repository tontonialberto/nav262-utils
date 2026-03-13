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
  
  <!-- ResumeEvaluationStep with string-only param: hoist to @varDescription and drop that param node -->
  <xsl:template match="ResumeEvaluationStep[param[not(*) and normalize-space(.) != '']]">
    <xsl:variable name="stringParam" select="param[not(*) and normalize-space(.) != ''][1]"/>
    <ResumeEvaluationStep>
      <xsl:apply-templates select="@*"/>
      <xsl:attribute name="varDescription">
        <xsl:value-of select="normalize-space($stringParam)"/>
      </xsl:attribute>
      <xsl:apply-templates select="node()[not(self::param[not(*) and normalize-space(.) != ''])]"/>
    </ResumeEvaluationStep>
  </xsl:template>
  
</xsl:stylesheet>