/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.studysahara.com',
  generateRobotsTxt: true,

  // Force a single sitemap file (no index)
  generateIndexSitemap: false,
  sitemapSize: 50000, // big enough to avoid splitting

  // Crawl hints
  changefreq: 'weekly',
  priority: 0.6,

  exclude: ['/askbot', '/success'],

  transform: async (config, path) => {
    const normalized = path.replace('/PNB', '/pnb');
    return {
      loc: `${config.siteUrl}${path}`,
      changefreq: path === '/' ? 'weekly' : config.changefreq,
      priority:
        path === '/'
          ? 1.0
          : [
              '/eligibility',
              '/no-co-applicant-and-no-collateral',
              '/co-applicant-and-no-collateral',
              '/us-co-applicant',
              '/co-applicant-and-collateral',
              '/PNB', // keep uppercase
            ].includes(path)
          ? 0.9
          : config.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    };
  },


  additionalPaths: async () => [],
};