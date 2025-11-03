/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.studysahara.com',
  generateRobotsTxt: true,

  // Single sitemap
  generateIndexSitemap: false,
  sitemapSize: 50000,

  changefreq: 'weekly',
  priority: 0.6,

  // ⛔ Exclude private/utility pages from sitemap
  exclude: ['/askbot', '/success', '/scan'],

  // Normalize and add higher priority to key pages
  transform: async (config, path) => {
    const normalized = path.replace(/\/+/g, '/').toLowerCase();
    return {
      loc: normalized,
      changefreq: config.changefreq,
      priority: [
        '/', '/eligibility',
        '/pnb',
        '/no-co-applicant-and-no-collateral',
        '/co-applicant-and-no-collateral',
        '/us-co-applicant',
        '/co-applicant-and-collateral',
      ].includes(normalized) ? 0.9 : config.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    };
  },

  additionalPaths: async () => [],
};
