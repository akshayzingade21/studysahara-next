/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.studysahara.com',
  generateRobotsTxt: true,

  // Force a single sitemap file (no index)
  generateIndexSitemap: false,
  sitemapSize: 50000, // large enough to avoid splitting

  // Crawl hints
  changefreq: 'weekly',
  priority: 0.6,

  exclude: ['/askbot', '/success'],

  transform: async (config, path) => {
    // ✅ Always normalize to lowercase so /PNB never leaks into sitemap
    const normalized = path.toLowerCase();

    return {
      loc: `${config.siteUrl}${normalized}`,
      changefreq: normalized === '/' ? 'weekly' : config.changefreq,
      priority:
        normalized === '/'
          ? 1.0
          : [
              '/eligibility',
              '/no-co-applicant-and-no-collateral',
              '/co-applicant-and-no-collateral',
              '/us-co-applicant',
              '/co-applicant-and-collateral',
              '/pnb', // ✅ lowercase only
            ].includes(normalized)
          ? 0.9
          : config.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    };
  },

  additionalPaths: async () => [],
};