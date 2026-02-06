/**
 * XML Oracle - Extracts URLs from sitemap XML
 */

import { XMLParser } from "fast-xml-parser";

interface SitemapStructure {
  urlset: {
    url: Array<{ loc: string }>;
  };
}

export class XmlOracle {
  private readonly transmuter: XMLParser;

  constructor() {
    this.transmuter = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
  }

  async fetchRemoteSitemap(nexusUrl: string): Promise<string> {
    const sitemapEndpoint = `${nexusUrl}/sitemap.xml`;
    const response = await fetch(sitemapEndpoint);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap from ${sitemapEndpoint}: ${response.statusText}`);
    }
    
    return await response.text();
  }

  transmuteXmlToStructure(xmlContent: string): SitemapStructure {
    return this.transmuter.parse(xmlContent) as SitemapStructure;
  }

  extractLocations(structure: SitemapStructure): string[] {
    if (!structure.urlset?.url) {
      return [];
    }

    return structure.urlset.url.map((entry) => entry.loc);
  }

  async divineUrls(nexusUrl: string): Promise<string[]> {
    const xmlContent = await this.fetchRemoteSitemap(nexusUrl);
    const structure = this.transmuteXmlToStructure(xmlContent);
    return this.extractLocations(structure);
  }
}
