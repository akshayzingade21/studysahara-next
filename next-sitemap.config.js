/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // Use your canonical, non-www host
  siteUrl: 'https://studysahara.com',

  // Generate /robots.txt automatically
  generateRobotsTxt: true,

  // General defaults
  changefreq: 'daily',
  priority: 0.7,

  // Exclude any routes you don’t want indexed (optional)
  exclude: ['/askbot', '/success'],

  // Normalize any odd paths if needed (e.g., uppercase)
  transform: async (config, path) => {
    const normalized = path.replace('/PNB', '/pnb');
    return {
      loc: `${config.siteUrl}${normalized}`,
      changefreq: config.changefreq,
      priority: normalized === '/' ? 1.0 : config.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [], // you can add hreflang later
    };
  },

  // If you ever need to add extra virtual URLs not in /app, put them here
  additionalPaths: async (config) => {
    return [
      // { loc: `${config.siteUrl}/some-extra-url`, changefreq: 'weekly', priority: 0.6, lastmod: new Date().toISOString() },
    ];
  },
};