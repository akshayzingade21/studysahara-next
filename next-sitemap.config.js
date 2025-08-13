/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.studysahara.com', // ✅ primary domain is www
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/askbot', '/success'], // optional

  // Normalize any odd paths (e.g. uppercase)
  transform: async (config, path) => {
    const normalized = path.replace('/PNB', '/pnb');
    return {
      loc: `${config.siteUrl}${normalized}`,
      changefreq: config.changefreq,
      priority: normalized === '/' ? 1.0 : config.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    };
  },

  // Add extra URLs if needed
  additionalPaths: async () => [],
};