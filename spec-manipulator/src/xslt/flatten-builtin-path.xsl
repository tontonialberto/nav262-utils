<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    
    <!-- Identity transform (copies everything by default) -->
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()" />
        </xsl:copy>
    </xsl:template>
    
    <!-- Transform the root BuiltinHead -->
    <xsl:template match="Algorithm/head/BuiltinHead">
        <xsl:copy>
            <xsl:attribute name="name">
                <xsl:call-template name="flattenPath">
                    <xsl:with-param name="node" select="path/*" />
                </xsl:call-template>
            </xsl:attribute>
            <!-- copy everything except <path> -->
            <xsl:apply-templates select="@*[name()!='name'] | node()[name()!='path']" />
        </xsl:copy>
    </xsl:template>
    
    <!-- Recursive template to flatten path -->
    <xsl:template name="flattenPath">
        <xsl:param name="node" />
        
        <xsl:choose>
            <xsl:when test="name($node)='Base'">
                <xsl:value-of select="$node/@name" />
            </xsl:when>
            <xsl:when test="name($node)='NormalAccess'">
                <xsl:call-template name="flattenPath">
                    <xsl:with-param name="node" select="$node/base/*" />
                </xsl:call-template>
                <xsl:text>.</xsl:text>
                <xsl:value-of select="$node/@name" />
            </xsl:when>
            <xsl:when test="name($node)='SymbolAccess'">
                <xsl:call-template name="flattenPath">
                    <xsl:with-param name="node" select="$node/base/*" />
                </xsl:call-template>
                <xsl:text>[@@</xsl:text>
                <xsl:value-of select="$node/@symbol" />
                <xsl:text>]</xsl:text>
            </xsl:when>
            <xsl:when test="name($node)='Getter'">
                <xsl:text>get </xsl:text>
                <xsl:call-template name="flattenPath">
                    <xsl:with-param name="node" select="$node/base/*" />
                </xsl:call-template>
            </xsl:when>
            <xsl:when test="name($node)='Setter'">
                <xsl:text>get </xsl:text>
                <xsl:call-template name="flattenPath">
                    <xsl:with-param name="node" select="$node/base/*" />
                </xsl:call-template>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    
</xsl:stylesheet>
