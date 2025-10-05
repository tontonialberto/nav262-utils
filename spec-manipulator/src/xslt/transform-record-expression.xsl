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
  
  <!-- Template for RecordExpression -->
  <xsl:template match="RecordExpression">
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <!-- Process fields in pairs -->
      <xsl:for-each select="fields[position() mod 2 = 1]">
        <fields>
          <RecordField>
            <field>
              <xsl:apply-templates select="node()"/>
            </field>
            <value>
              <xsl:apply-templates select="following-sibling::fields[1]/node()"/>
            </value>
          </RecordField>
        </fields>
      </xsl:for-each>
    </xsl:copy>
  </xsl:template>
  
</xsl:stylesheet>