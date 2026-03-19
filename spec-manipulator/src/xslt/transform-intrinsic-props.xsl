<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    
    <xsl:output method="xml" indent="yes" encoding="UTF-8"/>
    <xsl:strip-space elements="*"/>
    
    <!-- Identity transform (copies everything by default) -->
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
    
    <!-- Transform Intrinsic/props elements: keep props, create IntrinsicField as child only if text is not empty -->
    <xsl:template match="Intrinsic/props">
        <props>
            <xsl:if test="string-length(text()) > 0">
                <IntrinsicField name="{text()}"/>
            </xsl:if>
        </props>
    </xsl:template>
    
</xsl:stylesheet>